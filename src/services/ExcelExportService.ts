import * as XLSX from 'xlsx';

export class ExcelExportService {
  /**
   * Generates an Excel buffer with embedded intelligence
   * Note: The 'xlsx' library has limited support for actual Excel formulas 
   * in the way that they are live-calculated upon opening in some viewers, 
   * but we will set the cell types and values correctly.
   */
  static generateAttendanceTemplate(records: any[], weekNumber: number) {
    const wb = XLSX.utils.book_new();
    
    // Headers matching Master Prompt Part 1
    const headers = [
      "S.No", "Branch Code", "Total Strength", 
      "Day 1 Attended", "Day 1 %", 
      "Day 2 Attended", "Day 2 %", 
      "Day 3 Attended", "Day 3 %", 
      "Day 4 Attended", "Day 4 %", 
      "Day 5 Attended", "Day 5 %", 
      "Day 6 Attended", "Day 6 %", 
      "Weekly Average %", "No CRT Days", "Trend", "Performance", "Risk", "Remarks"
    ];

    const rows = records.map((r, i) => [
      i + 1,
      r.branch_code,
      r.total_strength,
      r.day1_attended, r.day1_percent,
      r.day2_attended, r.day2_percent,
      r.day3_attended, r.day3_percent,
      r.day4_attended, r.day4_percent,
      r.day5_attended, r.day5_percent,
      r.day6_attended, r.day6_percent,
      r.weekly_average_percent,
      r.no_crt_days,
      r.trend,
      r.performance_level,
      r.risk_flag,
      r.remarks
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Apply column widths for "Professional" feel
    ws['!cols'] = [
      { wch: 5 },  // S.No
      { wch: 15 }, // Branch
      { wch: 12 }, // Strength
      { wch: 15 }, { wch: 10 }, // D1
      { wch: 15 }, { wch: 10 }, // D2
      { wch: 15 }, { wch: 10 }, // D3
      { wch: 15 }, { wch: 10 }, // D4
      { wch: 15 }, { wch: 10 }, // D5
      { wch: 15 }, { wch: 10 }, // D6
      { wch: 18 }, // Avg
      { wch: 12 }, // No CRT
      { wch: 15 }, // Trend
      { wch: 15 }, // Perf
      { wch: 15 }, // Risk
      { wch: 30 }  // Remarks
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Week ${weekNumber} Attendance`);

    // In a real browser environment, we'd use XLSX.write and trigger download
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
