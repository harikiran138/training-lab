import { IUnifiedIngestionRecord } from './BaseParser';

export class ValidatorService {
  static validate(record: IUnifiedIngestionRecord): string[] {
    const errors: string[] = [];

    if (!record.branch_code || record.branch_code === 'UNKNOWN') {
      errors.push('Invalid Branch Code');
    }

    if (record.week_no <= 0) {
      errors.push('Invalid Week Number');
    }

    if (record.avg_attendance_percent < 0 || record.avg_attendance_percent > 100) {
      errors.push(`Impossible Attendance %: ${record.avg_attendance_percent}`);
    }

    if (record.avg_test_pass_percent < 0 || record.avg_test_pass_percent > 100) {
      errors.push(`Impossible Pass %: ${record.avg_test_pass_percent}`);
    }

    if (record.syllabus_covered > record.syllabus_total && record.syllabus_total > 0) {
      errors.push(`Covered syllabus (${record.syllabus_covered}) cannot exceed total (${record.syllabus_total})`);
    }

    return errors;
  }
}
