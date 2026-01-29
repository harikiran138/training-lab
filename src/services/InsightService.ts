
export interface DashboardData {
    stats: {
        totalStudents: number;
        laptopPercent: number;
        avgAttendance: number;
        avgPass: number;
        avgSyllabus: number;
    };
    summaries: any[];
    weeklyTrendData: any[];
}

export interface Insight {
    id: string;
    type: 'trend' | 'anomaly' | 'attention' | 'neutral';
    title: string;
    description: string;
    metric?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Prediction {
    week: string;
    attendance: number;
    passRate: number;
    isProjected: boolean;
}

/**
 * Generates rule-based insights to guarantee accuracy and numeric referencing.
 * acts as a deterministic fallback or primary "AI" engine for now.
 */
export function generateRuleBasedInsights(data: DashboardData): Insight[] {
    const insights: Insight[] = [];
    const { stats, summaries, weeklyTrendData } = data;

    // 1. Attendance Trend Check
    if (weeklyTrendData && weeklyTrendData.length >= 2) {
        const lastWeek = weeklyTrendData[weeklyTrendData.length - 1];
        const prevWeek = weeklyTrendData[weeklyTrendData.length - 2];

        const diff = lastWeek.attendance - prevWeek.attendance;
        if (Math.abs(diff) > 2) {
            insights.push({
                id: 'attendance-trend',
                type: 'trend',
                title: diff > 0 ? 'Attendance Improving' : 'Attendance Declining',
                description: `Overall attendance has ${diff > 0 ? 'increased' : 'dropped'} by ${Math.abs(diff).toFixed(1)}% from ${prevWeek.week_no} (${prevWeek.attendance}%) to ${lastWeek.week_no} (${lastWeek.attendance}%).`,
                sentiment: diff > 0 ? 'positive' : 'negative'
            });
        }
    }

    // 2. Low Performance Anomaly
    const lowPerformingBranch = summaries.reduce((lowest, curr) =>
        curr.avg_test_pass < lowest.avg_test_pass ? curr : lowest
        , summaries[0]);

    if (lowPerformingBranch && lowPerformingBranch.avg_test_pass < 50) {
        insights.push({
            id: 'low-perf-branch',
            type: 'attention',
            title: 'Critical Performance Issue',
            description: `Branch ${lowPerformingBranch.branch_code} represents a critical concern with an average test pass rate of only ${lowPerformingBranch.avg_test_pass.toFixed(1)}%, significantly below the acceptable threshold.`,
            sentiment: 'negative'
        });
    }

    // 3. High Variance Anomaly (High Attendance but Low Scores)
    summaries.forEach(branch => {
        if (branch.avg_attendance > 90 && branch.avg_test_pass < 60) {
            insights.push({
                id: `variance-${branch.branch_code}`,
                type: 'anomaly',
                title: 'Attendance-Performance Mismatch',
                description: `${branch.branch_code} has high attendance (${branch.avg_attendance.toFixed(1)}%) but unexpectedly low test scores (${branch.avg_test_pass.toFixed(1)}%), suggesting potential engagement or teaching issues.`,
                sentiment: 'negative'
            });
        }
    });

    // 4. Syllabus Completion Check
    const laggingSyllabus = summaries.filter(s => s.syllabus_completion_percent < 50);
    if (laggingSyllabus.length > 0) {
        const branches = laggingSyllabus.map(b => b.branch_code).join(', ');
        insights.push({
            id: 'syllabus-lag',
            type: 'attention',
            title: 'Syllabus Behind Schedule',
            description: `${laggingSyllabus.length} branch(es) (${branches}) are less than 50% complete with their syllabus.`,
            sentiment: 'negative'
        });
    }

    // 5. Laptop Availability Check
    if (stats.laptopPercent < 70) {
        insights.push({
            id: 'laptop-shortage',
            type: 'attention',
            title: 'Critical Infrastructure Gap',
            description: `Only ${stats.laptopPercent}% of students have laptops, which may be significantly hindering the effectiveness of digital-first CRT sessions.`,
            sentiment: 'negative'
        });
    }

    // Limit to top 5 insights
    return insights.slice(0, 5);
}

/**
 * Generates diagnostics specifically for a single section, potentially comparing it to dept averages.
 */
export function generateSectionInsights(
    sectionData: { week: string, attendance: number, passRate: number }[],
    deptAverage?: { attendance: number, passRate: number }
): Insight[] {
    const insights: Insight[] = [];
    if (sectionData.length === 0) return insights;

    const latest = sectionData[sectionData.length - 1];
    const prev = sectionData.length > 1 ? sectionData[sectionData.length - 2] : null;

    // 1. Internal Progress Trend
    if (prev) {
        const attDiff = latest.attendance - prev.attendance;
        if (Math.abs(attDiff) > 5) {
            insights.push({
                id: 'sec-att-trend',
                type: 'trend',
                title: attDiff > 0 ? 'Surging Attendance' : 'Attendance Drop',
                description: `This section saw a ${Math.abs(attDiff).toFixed(1)}% ${attDiff > 0 ? 'increase' : 'decrease'} in attendance this week.`,
                sentiment: attDiff > 0 ? 'positive' : 'negative'
            });
        }
    }

    // 2. Peer Benchmark (if average is provided)
    if (deptAverage) {
        const passDiff = latest.passRate - deptAverage.passRate;
        if (passDiff > 10) {
            insights.push({
                id: 'sec-peer-high',
                type: 'trend',
                title: 'High Performance Lead',
                description: `This section is outperforming the department average pass rate by ${passDiff.toFixed(1)}%.`,
                sentiment: 'positive'
            });
        } else if (passDiff < -15) {
            insights.push({
                id: 'sec-peer-low',
                type: 'attention',
                title: 'Below Benchmark',
                description: `Current pass rate is ${Math.abs(passDiff).toFixed(1)}% lower than the departmental average. Attention may be required.`,
                sentiment: 'negative'
            });
        }
    }

    // 3. Consistency Anomaly: High Attendance but Low Scores
    if (latest.attendance > 90 && latest.passRate < 50) {
        insights.push({
            id: 'sec-mismatch',
            type: 'anomaly',
            title: 'Performance Paradox',
            description: 'This section maintains high physical engagement (attendance > 90%) but demonstrates suboptimal academic output (pass rate < 50%). Investigate teaching methodology vs. assessment difficulty.',
            sentiment: 'negative'
        });
    }

    // 4. Critical Surge Check
    if (prev && latest.passRate - prev.passRate > 20) {
        insights.push({
            id: 'sec-surge',
            type: 'trend',
            title: 'Remarkable Velocity',
            description: `Academic pass rates surged by ${(latest.passRate - prev.passRate).toFixed(1)}% this week. Verify if this is due to specific interventions or outlier assessments.`,
            sentiment: 'positive'
        });
    }

    return insights.slice(0, 4);
}

// Simulating Async AI Call
export async function fetchAIInsights(data: DashboardData): Promise<Insight[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateRuleBasedInsights(data));
        }, 1500);
    });
}

/**
 * Linear Regression for simple time-series forecasting
 */
function calculateRegression(values: number[]): { slope: number, intercept: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

/**
 * Generates predictions for the next N weeks
 */
export function generatePredictions(weeklyData: any[], horizon = 3): Prediction[] {
    if (!weeklyData || weeklyData.length < 2) return [];

    const attendanceValues = weeklyData.map(d => d.attendance);
    const passValues = weeklyData.map(d => d.test_pass || d.pass || 0);

    const attReg = calculateRegression(attendanceValues);
    const passReg = calculateRegression(passValues);

    const lastWeekNo = parseInt(weeklyData[weeklyData.length - 1].week_no.replace('W', '')) || weeklyData.length;
    const predictions: Prediction[] = [];

    for (let i = 1; i <= horizon; i++) {
        const x = weeklyData.length + i - 1;
        const predictedAtt = Math.min(100, Math.max(0, attReg.slope * x + attReg.intercept));
        const predictedPass = Math.min(100, Math.max(0, passReg.slope * x + passReg.intercept));

        predictions.push({
            week: `W${lastWeekNo + i} (P)`,
            attendance: parseFloat(predictedAtt.toFixed(1)),
            passRate: parseFloat(predictedPass.toFixed(1)),
            isProjected: true
        });
    }

    return predictions;
}
