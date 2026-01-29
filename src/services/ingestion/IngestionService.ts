import { FileParserFactory } from './FileParserFactory';
import { ValidatorService } from './ValidatorService';
import { DataNormalizer } from './DataNormalizer';

export class IngestionService {
  static async processFile(fileBuffer: Buffer, fileName: string, mimeType: string) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    // Note: Log Start would now ideally happen in the backend 
    // but for parity we can keep the local log if MongoDB is still active for logs
    // However, the instructions imply moving AWAY from MongoDB.
    // I will focus on pushing data to Postgres.

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
            severity: 'CRITICAL'
          });
          continue;
        }

        // 3. Transform for Backend
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
          )
        });
      }

      // 4. Push to Backend
      if (successRecords.length > 0) {
        const res = await fetch(`${backendUrl}/departments/weekly-reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(successRecords)
        });
        if (!res.ok) throw new Error('Backend sync failed');
      }

      return {
        success: successRecords.length,
        fails: anomalies.length,
        anomalies
      };

    } catch (error: any) {
      console.error('Ingestion Error:', error);
      throw error;
    }
  }
}
