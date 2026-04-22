import { FileParserFactory } from './FileParserFactory';
import { ValidatorService } from './ValidatorService';
import { DataNormalizer } from './DataNormalizer';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import IngestionLog from '@/models/IngestionLog';

export class IngestionService {
  static async processFile(fileBuffer: Buffer, fileName: string, mimeType: string) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    try {
      // 1. Parse
      const parser = FileParserFactory.getParser(mimeType, fileName);
      const records = await parser.parse(fileBuffer);

      const successRecords = [];
      const anomalies = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        // 2. Validate
        const errors = ValidatorService.validate(record);
        if (errors.length > 0) {
          anomalies.push({
            row_index: i + 1,
            issue: errors.join(', '),
            value: record,
            severity: 'CRITICAL' as const
          });
          continue;
        }

        // 3. Transform
        successRecords.push({
          departmentCode: record.branch_code,
          weekNo: record.week_no,
          avgAttendance: record.avg_attendance_percent,
          avgTestPass: record.avg_test_pass_percent,
          unitsCovered: record.syllabus_covered,
          totalUnits: record.syllabus_total,
          riskLevel: DataNormalizer.getRiskLevel(
            record.avg_attendance_percent,
            record.avg_test_pass_percent,
            'On-Track'
          ),
          // Keep original for MongoDB save
          _original: record
        });
      }

      // 4. Try to push to NestJS backend first, fall back to MongoDB
      let savedToBackend = false;
      if (successRecords.length > 0) {
        try {
          const res = await fetch(`${backendUrl}/departments/weekly-reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(successRecords.map(r => {
              const { _original, ...rest } = r;
              return rest;
            })),
            signal: AbortSignal.timeout(3000) // 3s timeout, don't block on down backend
          });
          if (res.ok) savedToBackend = true;
        } catch {
          // Backend unavailable — falling back to MongoDB
          console.warn('[IngestionService] Backend unavailable, saving to MongoDB.');
        }

        if (!savedToBackend) {
          // Fallback: Save directly to CRTWeeklyReport (MongoDB)
          await dbConnect();
          for (const rec of successRecords) {
            const r = rec._original;
            await CRTWeeklyReport.findOneAndUpdate(
              { branch_code: r.branch_code, week_no: r.week_no },
              {
                branch_code: r.branch_code,
                week_no: r.week_no,
                sessions: r.sessions || 0,
                attendance: { avg_attendance_percent: r.avg_attendance_percent },
                tests: {
                  avg_test_attendance_percent: r.avg_test_attendance_percent,
                  avg_test_pass_percent: r.avg_test_pass_percent
                },
                syllabus: {
                  covered: r.syllabus_covered,
                  total: r.syllabus_total,
                  coverage_percent: r.syllabus_total > 0 ? (r.syllabus_covered / r.syllabus_total) * 100 : 0,
                  status: 'On-Track'
                },
                computed: {
                  attendance_score: 0,
                  test_score: 0,
                  overall_score: 0,
                  risk_level: rec.riskLevel
                }
              },
              { upsert: true, new: true }
            );
          }

          // Log the ingestion
          await IngestionLog.create({
            filename: fileName,
            upload_date: new Date(),
            processed_rows: records.length,
            success_count: successRecords.length,
            error_count: anomalies.length,
            status: anomalies.length > 0 ? 'PARTIAL_SUCCESS' : 'COMPLETED',
            anomalies
          });
        }
      }

      return {
        success: successRecords.length,
        fails: anomalies.length,
        anomalies,
        savedTo: savedToBackend ? 'backend' : 'mongodb'
      };

    } catch (error: any) {
      console.error('Ingestion Error:', error);
      throw error;
    }
  }
}
