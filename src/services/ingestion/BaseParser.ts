
export interface IUnifiedIngestionRecord {
  branch_code: string;
  week_no: number;
  sessions: number;
  avg_attendance_percent: number;
  avg_test_attendance_percent: number;
  avg_test_pass_percent: number;
  syllabus_covered: number;
  syllabus_total: number;
  section_metrics?: any[];
  raw_data?: any;
}

export abstract class BaseParser {
  abstract parse(fileBuffer: Buffer): Promise<IUnifiedIngestionRecord[]>;
}
