import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SyllabusService } from '../departments/syllabus.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private dataSource: DataSource,
    private syllabusService: SyllabusService
  ) { }

  async getDashboardMetrics() {
    // 1. Overall KPIs
    const kpiQuery = `
      SELECT 
        COALESCE(
          (SELECT AVG(CAST(status = 'PRESENT' AS INT)) * 100 FROM attendance_entries),
          (SELECT AVG(avg_attendance) FROM weekly_reports)
        ) as avg_attendance,
        COALESCE(
          (SELECT AVG((obtained_marks / b.total_marks) * 100) FROM assessment_entries a JOIN assessments b ON a.assessment_id = b.id),
          (SELECT AVG(avg_test_pass) FROM weekly_reports)
        ) as avg_pass_rate,
        (SELECT COUNT(DISTINCT id) FROM departments) as total_departments,
        (SELECT COUNT(*) FROM students WHERE is_active = true) as total_students,
        (SELECT (COUNT(CASE WHEN has_laptop THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) FROM students WHERE is_active = true) as laptop_coverage
    `;
    const kpis = await this.dataSource.query(kpiQuery);

    // Aggregation via dedicated service for cleaner domain logic
    const realSyllabusCompletion = await this.syllabusService.calculateOverallCompletion();

    // 2. Section Performance (Rankings)
    const rankingQuery = `
      SELECT 
        s.name as section_name,
        d.code as dept_code,
        AVG(CAST(ae.status = 'PRESENT' AS INT)) * 100 as attendance_pct,
        (
          SELECT AVG(COALESCE(a.obtained_marks / b.total_marks, 0)) * 100
          FROM assessments b
          LEFT JOIN assessment_entries a ON a.assessment_id = b.id
          WHERE b.section_id = s.id
        ) as test_pass_pct,
        COALESCE(
          (SELECT MAX(units_covered * 100.0 / NULLIF(total_units, 0)) FROM syllabus_progress sp WHERE sp.section_id = s.id),
          0
        ) as syllabus_pct
      FROM sections s
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN attendance_sessions sess ON sess.section_id = s.id
      LEFT JOIN attendance_entries ae ON ae.session_id = sess.id
      GROUP BY s.id, s.name, d.code
      ORDER BY attendance_pct DESC
    `;
    const rankings = await this.dataSource.query(rankingQuery);

    return {
      kpis: {
        ...kpis[0],
        syllabus_completion: realSyllabusCompletion
      },
      rankings
    };
  }

  async getStudentAnalytics() {
    // 1. Student KPIs
    const kpiQuery = `
      SELECT 
        (SELECT COUNT(*) FROM students WHERE is_active = true) as total_enrollment,
        (SELECT AVG(status_pct) FROM (
          SELECT AVG(CAST(status = 'PRESENT' AS INT)) * 100 as status_pct 
          FROM attendance_entries ae 
          JOIN attendance_sessions s ON ae.session_id = s.id 
          WHERE s.date > (CURRENT_DATE - INTERVAL '7 days')
          GROUP BY ae.student_id
        ) sub) as avg_attendance_weekly,
        (SELECT COUNT(*) FROM (
          SELECT AVG(CAST(status = 'PRESENT' AS INT)) * 100 as att_pct 
          FROM attendance_entries 
          GROUP BY student_id
          HAVING AVG(CAST(status = 'PRESENT' AS INT)) < 0.75
        ) risk_group) as at_risk_count,
         (SELECT (COUNT(CASE WHEN has_laptop THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) FROM students WHERE is_active = true) as laptop_coverage
    `;

    const kpis = await this.dataSource.query(kpiQuery);

    // 2. Enrollment by Department
    const enrollmentQuery = `
      SELECT 
        d.code as branch,
        COUNT(s.id) as count
      FROM students s
      JOIN sections sec ON s.section_id = sec.id
      JOIN departments d ON sec.department_id = d.id
      WHERE s.is_active = true
      GROUP BY d.code
    `;
    const demographics = await this.dataSource.query(enrollmentQuery);

    // 3. Weekly Trends (Re-use existing logic)
    const trends = await this.getWeeklyTrends();

    return {
      kpis: kpis[0],
      demographics,
      trends
    };
  }

  async getWeeklyTrends() {
    const trendQuery = `
      SELECT 
        sess.date as period,
        AVG(CAST(ae.status = 'PRESENT' AS INT)) * 100 as attendance,
        (
          SELECT AVG((a2.obtained_marks / b2.total_marks) * 100)
          FROM assessment_entries a2 
          JOIN assessments b2 ON a2.assessment_id = b2.id
          WHERE b2.scheduled_at::date = sess.date
        ) as average_score
      FROM attendance_sessions sess
      JOIN attendance_entries ae ON ae.session_id = sess.id
      GROUP BY sess.date
      ORDER BY sess.date ASC
      LIMIT 12
    `;
    return this.dataSource.query(trendQuery);
  }
}
