/**
 * CRT Attendance Calculation Service
 * Refined for granular daily reporting and institutional presentation
 */

export interface BranchAttendance {
  branch: string;
  strength: number;
  daily: (number | "No CRT")[]; // Day 1 to Day 6
}

export interface CalculatedBranch {
  branch: string;
  strength: number;
  attendanceCounts: (number | "No CRT")[];
  attendancePercents: (number | "No CRT")[];
  weeklyAvg: number;
  trend: "up" | "down" | "stable";
}

export interface DashboardMetrics {
  totalStudents: number;
  avgAttendance: number;
  highestBranch: { name: string; percent: number };
  lowestBranch: { name: string; percent: number };
  totalSessions: number;
  missedSessions: number;
  statusBadge: "Excellent" | "Good" | "Needs Attention";
}

export class CrtAttendanceService {
  /**
   * Main processor for raw branch data
   */
  static processData(data: BranchAttendance[]): {
    calculatedBranches: CalculatedBranch[];
    metrics: DashboardMetrics;
    insights: string[];
    alerts: string[];
  } {
    let totalStrength = 0;
    let grandTotalAttendance = 0;
    let totalPossibleAttendanceCount = 0;
    let totalSessions = 0;
    let missedSessions = 0;

    const calculatedBranches: CalculatedBranch[] = data.map((b) => {
      totalStrength += b.strength;
      
      let branchAttendanceSum = 0;
      let branchSessionsCount = 0;

      const percents = b.daily.map((count) => {
        if (count === "No CRT") {
          missedSessions++;
          return "No CRT";
        }
        
        totalSessions++;
        branchSessionsCount++;
        branchAttendanceSum += count;
        
        // Use institutional rounding (whole numbers)
        const percent = Math.round((count / b.strength) * 100);
        return percent;
      });

      const weeklyAvg = branchSessionsCount > 0 
        ? Math.round((branchAttendanceSum / (branchSessionsCount * b.strength)) * 100) 
        : 0;

      grandTotalAttendance += branchAttendanceSum;
      totalPossibleAttendanceCount += (branchSessionsCount * b.strength);

      // Trend logic: compare last 2 active days
      const activeDays = percents.filter(p => typeof p === 'number') as number[];
      let trend: "up" | "down" | "stable" = "stable";
      if (activeDays.length >= 2) {
        const last = activeDays[activeDays.length - 1];
        const prev = activeDays[activeDays.length - 2];
        if (last > prev + 1) trend = "up";
        else if (last < prev - 1) trend = "down";
      }

      return {
        branch: b.branch,
        strength: b.strength,
        attendanceCounts: b.daily,
        attendancePercents: percents,
        weeklyAvg,
        trend
      };
    });

    const avgAttendance = totalPossibleAttendanceCount > 0 
      ? Math.round((grandTotalAttendance / totalPossibleAttendanceCount) * 100) 
      : 0;

    const sortedByAtt = [...calculatedBranches].sort((a, b) => b.weeklyAvg - a.weeklyAvg);
    
    const metrics: DashboardMetrics = {
      totalStudents: totalStrength,
      avgAttendance,
      highestBranch: { 
        name: sortedByAtt[0]?.branch || "N/A", 
        percent: sortedByAtt[0]?.weeklyAvg || 0 
      },
      lowestBranch: { 
        name: sortedByAtt[sortedByAtt.length - 1]?.branch || "N/A", 
        percent: sortedByAtt[sortedByAtt.length - 1]?.weeklyAvg || 0 
      },
      totalSessions,
      missedSessions,
      statusBadge: avgAttendance >= 85 ? "Excellent" : avgAttendance >= 70 ? "Good" : "Needs Attention"
    };

    const insights = this.generateInsights(calculatedBranches, metrics);
    const alerts = this.generateAlerts(calculatedBranches);

    return { calculatedBranches, metrics, insights, alerts };
  }

  private static generateInsights(branches: CalculatedBranch[], metrics: DashboardMetrics): string[] {
    const insights: string[] = [];
    
    insights.push(`Overall institutional attendance for this week stands at ${metrics.avgAttendance}%, reflecting ${metrics.statusBadge} program compliance.`);
    
    if (metrics.highestBranch.percent > 90) {
      insights.push(`Branch ${metrics.highestBranch.name} is leading with a stellar ${metrics.highestBranch.percent}% attendance.`);
    }

    const improvingBranches = branches.filter(b => b.trend === 'up');
    if (improvingBranches.length > 0) {
      insights.push(`${improvingBranches.length} branches show a positive attendance trajectory compared to previous sessions.`);
    }

    if (metrics.missedSessions > 0) {
      insights.push(`Recorded ${metrics.missedSessions} 'No CRT' blocks; syllabus completion targets must be adjusted accordingly.`);
    }

    return insights;
  }

  private static generateAlerts(branches: CalculatedBranch[]): string[] {
    const alerts: string[] = [];
    
    branches.forEach(b => {
      // Alert 1: Sustainably Low (<50% for 2+ days)
      const lowDays = b.attendancePercents.filter(p => typeof p === 'number' && p < 50).length;
      if (lowDays >= 2) {
        alerts.push(`CRITICAL: ${b.branch} exhibits persistent low attendance (<50%) for ${lowDays} days.`);
      }

      // Alert 2: Volatility Check (Sudden drop > 15%)
      const activePercents = b.attendancePercents.filter(p => typeof p === 'number') as number[];
      if (activePercents.length >= 2) {
        const last = activePercents[activePercents.length - 1];
        const prev = activePercents[activePercents.length - 2];
        if (prev - last > 15) {
          alerts.push(`VOLATILITY: Sudden ${prev - last}% drop in ${b.branch} attendance detected between sessions.`);
        }
      }

      // Alert 3: Critical Weekly Average
      if (b.weeklyAvg < 50) {
        alerts.push(`INTERVENTION REQUIRED: ${b.branch} weekly average is critically low (${b.weeklyAvg}%).`);
      }
    });

    return alerts;
  }
}
