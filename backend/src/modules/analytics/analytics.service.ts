import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
    constructor(private dataSource: DataSource) { }

    async getDashboardMetrics() {
        // 1. Overall KPIs
        const kpiQuery = `
      SELECT 
        (SELECT AVG(CAST(status = 'PRESENT' AS INT)) * 100 FROM attendance_entries) as avg_attendance,
        (SELECT AVG(obtained_marks / b.total_marks) * 100 
         FROM assessment_entries a 
         JOIN assessments b ON a.assessment_id = b.id) as avg_pass_rate,
        (SELECT COUNT(DISTINCT id) FROM departments) as total_departments
    `;
        const kpis = await this.dataSource.query(kpiQuery);

        // 2. Section Performance (Rankings)
        const rankingQuery = `
      SELECT 
        s.name as section_name,
        d.code as dept_code,
        AVG(CAST(ae.status = 'PRESENT' AS INT)) * 100 as attendance_pct
      FROM sections s
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN attendance_sessions sess ON sess.section_id = s.id
      LEFT JOIN attendance_entries ae ON ae.session_id = sess.id
      GROUP BY s.id, s.name, d.code
      ORDER BY attendance_pct DESC
    `;
        const rankings = await this.dataSource.query(rankingQuery);

        return {
            kpis: kpis[0],
            rankings
        };
    }

    async getWeeklyTrends() {
        const trendQuery = `
      SELECT 
        sess.date as period,
        AVG(CAST(ae.status = 'PRESENT' AS INT)) * 100 as attendance,
        (
          SELECT AVG(obtained_marks) 
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
