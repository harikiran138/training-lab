import { BaseParser, IUnifiedIngestionRecord } from './BaseParser';
import * as XLSX from 'xlsx';
import { DataNormalizer } from './DataNormalizer';

export class ExcelParser extends BaseParser {
  async parse(fileBuffer: Buffer): Promise<IUnifiedIngestionRecord[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const records: IUnifiedIngestionRecord[] = [];

    for (const row of jsonData as any[]) {
      // Logic to map row keys to unified record
      // This assumes a standard format or "best guess" approach
      // In production, we might need a mapping config or heuristics
      
      const branchRaw = row['Branch'] || row['branch'] || row['Department'];
      const weekRaw = row['Week'] || row['week'] || row['Week No'];
      
      if (!branchRaw || !weekRaw) continue; // Skip bad rows

      const record: IUnifiedIngestionRecord = {
        branch_code: DataNormalizer.normalizeBranchCode(branchRaw),
        week_no: parseInt(weekRaw) || 0,
        sessions: parseInt(row['Sessions'] || row['No of Sessions'] || '0'),
        avg_attendance_percent: DataNormalizer.normalizePercent(row['Avg Attendance'] || row['Attendance %'] || 0),
        avg_test_attendance_percent: DataNormalizer.normalizePercent(row['Test Attendance'] || row['Avg Test Attd'] || 0),
        avg_test_pass_percent: DataNormalizer.normalizePercent(row['Pass %'] || row['Avg Pass %'] || 0),
        syllabus_covered: parseInt(row['Covered Topics'] || row['Syllabus Covered'] || '0'),
        syllabus_total: parseInt(row['Total Topics'] || row['Total Syllabus'] || '0'),
        raw_data: row
      };

      records.push(record);
    }

    return records;
  }
}
