import { ICrtAttendanceRecord } from '@/models/CrtAttendanceRecord';
import { Types } from 'mongoose';

/**
 * CRT Attendance Calculation Service
 * Consolidated for Excel-style intelligence and Database Persistence
 */

export interface BranchAttendanceInput {
  branch_code: string;
  strength: number;
  daily: (number | "No CRT")[]; // Day 1 to Day 6
  academic_year?: string;
  batch?: string;
}

export interface CalculatedRecord {
  branch_code: string;
  total_strength: number;
  // Raw and Percent
  days: {
    attended: (number | "No CRT")[];
    percent: (number | "No CRT")[];
    dates?: Date[]; // Actual dates for the week
  };
  // Summary
  weekly_average_percent: number;
  no_crt_days: number;
  trend: string;
  performance_level: 'High' | 'Medium' | 'Low';
  risk_flag: 'RED' | 'AMBER' | 'GREEN';
  remarks: string;
}

export class CrtAttendanceService {
  /**
   * Main processor strictly following the Master Prompt Logic
   */
  static processData(data: BranchAttendanceInput[]): CalculatedRecord[] {
    return data.map((b) => {
      const strength = Math.max(b.strength, 1);
      
      // 1. Day-wise Attendance % (Auto)
      const percents = b.daily.map((attended) => {
        if (attended === "No CRT") return "No CRT";
        return Math.round((attended / strength) * 100);
      });

      // 2. Weekly Average %
      const activePercents = percents.filter(p => typeof p === 'number') as number[];
      const weekly_average_percent = activePercents.length > 0 
        ? Math.round(activePercents.reduce((acc, curr) => acc + curr, 0) / activePercents.length)
        : 0;

      // 3. No CRT Days
      const no_crt_days = b.daily.filter(d => d === "No CRT").length;

      // 4. Trend Indicator
      let trend = "–";
      if (activePercents.length >= 2) {
        const last = activePercents[activePercents.length - 1];
        const prev = activePercents[activePercents.length - 2];
        if (last > prev) trend = "↑ Improving";
        else if (last < prev) trend = "↓ Dropping";
        else trend = "→ Stable";
      }

      // 5. Performance Level
      const performance_level = weekly_average_percent >= 75 ? 'High' : (weekly_average_percent >= 50 ? 'Medium' : 'Low');

      // 6. Risk Flag
      const risk_flag = weekly_average_percent < 50 ? 'RED' : 'GREEN';

      // 7. Auto Remarks
      const remarks = risk_flag === 'RED' ? "Immediate intervention required" : "Stable";

      return {
        branch_code: b.branch_code,
        total_strength: b.strength,
        days: {
          attended: b.daily,
          percent: percents
        },
        weekly_average_percent,
        no_crt_days,
        trend,
        performance_level,
        risk_flag,
        remarks
      };
    });
  }

  /**
   * Transforms a calculated record into a V2 DB object
   */
  static flattenForDB(
    record: CalculatedRecord, 
    week_number: number, 
    branch_id: Types.ObjectId,
    meta: { academic_year: string, batch: string, dates: Date[], status: 'LOCKED' | 'DRAFT' }
  ) {
    const daily_stats = record.days.attended.map((val, idx) => ({
        date: meta.dates[idx] || new Date(),
        day_name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx],
        attended: typeof val === 'number' ? val : 0,
        topic_covered: typeof val === 'string' ? val : ""
    }));

    // Ensure we don't have overlapping fields
    return {
      branch_id: branch_id,
      academic_year: meta.academic_year,
      week_number: week_number,
      week_start_date: meta.dates[0] || new Date(),
      week_end_date: meta.dates[5] || new Date(),
      
      batch: meta.batch,
      
      total_strength: record.total_strength,
      attended_count: record.days.attended.filter(x => typeof x === 'number').reduce((a, b) => (a as number) + (b as number), 0) as number,
      attendance_percentage: record.weekly_average_percent,
      
      daily_stats: daily_stats,
      
      // Legacy mapping (optional, for backward compat visual)
      day1_attended: typeof record.days.attended[0] === 'number' ? record.days.attended[0] : 0,
      day2_attended: typeof record.days.attended[1] === 'number' ? record.days.attended[1] : 0,
      day3_attended: typeof record.days.attended[2] === 'number' ? record.days.attended[2] : 0,
      day4_attended: typeof record.days.attended[3] === 'number' ? record.days.attended[3] : 0,
      day5_attended: typeof record.days.attended[4] === 'number' ? record.days.attended[4] : 0,
      day6_attended: typeof record.days.attended[5] === 'number' ? record.days.attended[5] : 0,

      risk_flag: record.risk_flag,
      performance_level: record.performance_level,
      remarks: record.remarks,
      trend: record.trend || "Stable (+0%)",
      
      is_locked: meta.status === 'LOCKED'
    };
  }
}
