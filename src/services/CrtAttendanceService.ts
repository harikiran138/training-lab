/**
 * CRT Attendance Calculation Service
 * Consolidated for Excel-style intelligence and Database Persistence
 */

export interface BranchAttendance {
  branch: string;
  strength: number;
  daily: (number | "No CRT")[]; // Day 1 to Day 6
}

export interface CalculatedRecord {
  branch_code: string;
  total_strength: number;
  // Raw and Percent
  days: {
    attended: (number | "No CRT")[];
    percent: (number | "No CRT")[];
  };
  // Summary
  weekly_average_percent: number;
  no_crt_days: number;
  trend: string;
  performance_level: 'High' | 'Medium' | 'Low';
  risk_flag: '⚠ Critical' | 'OK';
  remarks: string;
}

export class CrtAttendanceService {
  /**
   * Main processor strictly following the Master Prompt Logic
   */
  static processData(data: BranchAttendance[]): CalculatedRecord[] {
    return data.map((b) => {
      const strength = Math.max(b.strength, 1);
      
      // 1. Day-wise Attendance % (Auto)
      // Formula: =IF(D2="","No CRT",ROUND(D2/C2*100,0))
      const percents = b.daily.map((attended) => {
        if (attended === "No CRT") return "No CRT";
        return Math.round((attended / strength) * 100);
      });

      // 2. Weekly Average %
      // Formula: =ROUND(AVERAGEIF(E2:O2,"<>No CRT"),0)
      const activePercents = percents.filter(p => typeof p === 'number') as number[];
      const weekly_average_percent = activePercents.length > 0 
        ? Math.round(activePercents.reduce((acc, curr) => acc + curr, 0) / activePercents.length)
        : 0;

      // 3. No CRT Days
      // Formula: =COUNTIF(E2:O2,"No CRT")
      const no_crt_days = b.daily.filter(d => d === "No CRT").length;

      // 4. Trend Indicator
      // Formula: Comparison between last two active days
      let trend = "–";
      if (activePercents.length >= 2) {
        const last = activePercents[activePercents.length - 1];
        const prev = activePercents[activePercents.length - 2];
        if (last > prev) trend = "↑ Improving";
        else if (last < prev) trend = "↓ Dropping";
        else trend = "→ Stable";
      }

      // 5. Performance Level
      // Formula: =IF(P2>=75,"High",IF(P2>=50,"Medium","Low"))
      const performance_level = weekly_average_percent >= 75 ? 'High' : (weekly_average_percent >= 50 ? 'Medium' : 'Low');

      // 6. Risk Flag
      // Formula: =IF(P2<50,"⚠ Critical","OK")
      const risk_flag = weekly_average_percent < 50 ? '⚠ Critical' : 'OK';

      // 7. Auto Remarks
      // Formula: =IF(T2="⚠ Critical","Immediate intervention required","Stable")
      const remarks = risk_flag === '⚠ Critical' ? "Immediate intervention required" : "Stable";

      return {
        branch_code: b.branch,
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
   * Transforms a calculated record into a flat object for Database ingestion
   */
  static flattenForDB(record: CalculatedRecord, week_number: number) {
    return {
      branch_code: record.branch_code,
      total_strength: record.total_strength,
      day1_attended: record.days.attended[0],
      day1_percent: record.days.percent[0],
      day2_attended: record.days.attended[1],
      day2_percent: record.days.percent[1],
      day3_attended: record.days.attended[2],
      day3_percent: record.days.percent[2],
      day4_attended: record.days.attended[3],
      day4_percent: record.days.percent[3],
      day5_attended: record.days.attended[4],
      day5_percent: record.days.percent[4],
      day6_attended: record.days.attended[5],
      day6_percent: record.days.percent[5],
      weekly_average_percent: record.weekly_average_percent,
      no_crt_days: record.no_crt_days,
      trend: record.trend,
      performance_level: record.performance_level,
      risk_flag: record.risk_flag,
      remarks: record.remarks,
      week_number
    };
  }
}
