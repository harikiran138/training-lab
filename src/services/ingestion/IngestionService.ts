import { FileParserFactory } from './FileParserFactory';
import { ValidatorService } from './ValidatorService';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import IngestionLog from '@/models/IngestionLog';
import { DataNormalizer } from './DataNormalizer';
import dbConnect from '@/lib/mongodb';

export class IngestionService {
  static async processFile(fileBuffer: Buffer, fileName: string, mimeType: string) {
    await dbConnect();
    
    // 1. Log Start
    const log = await IngestionLog.create({
      filename: fileName,
      status: 'PROCESSING'
    });

    try {
      // 2. Parse
      const parser = FileParserFactory.getParser(mimeType, fileName);
      const records = await parser.parse(fileBuffer);
      
      let success = 0;
      let fails = 0;
      const anomalies = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // 3. Validate
        const errors = ValidatorService.validate(record);
        if (errors.length > 0) {
          fails++;
          anomalies.push({
            row_index: i + 1,
            issue: errors.join(', '),
            value: record,
            severity: 'CRITICAL'
          });
          continue; 
        }

        // 4. Transform & Save
        const riskLevel = DataNormalizer.getRiskLevel(
          record.avg_attendance_percent, 
          record.avg_test_pass_percent, 
          'On-Track' // TODO: Calculate status dynamically
        );

        // Calculate syllabus status
        let syllabusStatus = 'On-Track';
        if (record.syllabus_total > 0) {
            const coverage = (record.syllabus_covered / record.syllabus_total) * 100;
             if (coverage < 50) syllabusStatus = 'Lagging'; // Simple heuristic
        }

        await CRTWeeklyReport.findOneAndUpdate(
          { 
            branch_code: record.branch_code, 
            week_no: record.week_no 
          },
          {
            $set: {
              sessions: record.sessions,
              attendance: {
                avg_attendance_percent: record.avg_attendance_percent
              },
              tests: {
                avg_test_attendance_percent: record.avg_test_attendance_percent,
                avg_test_pass_percent: record.avg_test_pass_percent
              },
              syllabus: {
                covered: record.syllabus_covered,
                total: record.syllabus_total,
                status: syllabusStatus
              },
              computed: {
                risk_level: riskLevel
              }
            }
          },
          { upsert: true, new: true }
        );
        
        success++;
      }

      // 5. Finalize Log
      log.status = fails > 0 ? (success > 0 ? 'PARTIAL_SUCCESS' : 'FAILED') : 'COMPLETED';
      log.processed_rows = records.length;
      log.success_count = success;
      log.error_count = fails;
      log.anomalies = anomalies;
      await log.save();

      // 6. Trigger Live Analytics Refresh
      // Fire and forget (or await if strict) - awaiting for consistency
      if (success > 0) {
        await import('../analytics/AnalyticsService').then(mod => mod.AnalyticsService.refreshAggregates());
      }

      return { success, fails, logId: log._id };

    } catch (error: any) {
      log.status = 'FAILED';
      log.anomalies.push({
        issue: error.message,
        severity: 'CRITICAL'
      });
      await log.save();
      throw error;
    }
  }
}
