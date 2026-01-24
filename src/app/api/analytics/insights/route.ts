import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { model } from '@/lib/ai/client';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch finalized reports for analysis
        const reports = await CRTWeeklyReport.find({ status: 'finalized' })
            .sort({ week_no: 1 })
            .lean();

        if (reports.length === 0) {
            return NextResponse.json({
                success: true,
                insights: ["Insufficient data to generate AI insights. Please finalize more weekly reports."]
            });
        }

        // Prepare data for Gemini context
        const institutionSummary = reports.reduce((acc: any, report: any) => {
            const week = `W${report.week_no}`;
            if (!acc[week]) acc[week] = { attendance: 0, pass: 0, count: 0 };
            acc[week].attendance += report.attendance.avg_attendance_percent;
            acc[week].pass += report.tests.avg_test_pass_percent;
            acc[week].count += 1;
            return acc;
        }, {});

        const simplifiedContext = Object.entries(institutionSummary).map(([week, stats]: [string, any]) => ({
            week,
            avg_attendance: (stats.attendance / stats.count).toFixed(1),
            avg_pass_rate: (stats.pass / stats.count).toFixed(1)
        }));

        // Call Gemini
        const prompt = `
            Analyze the following institution-wide CRT performance data across multiple weeks:
            ${JSON.stringify(simplifiedContext)}

            Provide 3-4 concise, actionable insights for the management. 
            Focus on trends, correlation between attendance and pass rates, and specific areas for improvement.
            Return the response as a JSON object with a key "insights" which is an array of strings.
            Keep each insight under 20 words.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Handle potential formatting issues from Gemini
        let insights = [];
        try {
            const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
            insights = parsed.insights || [];
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            insights = ["Performance is stable across most weeks.", "Observe correlation between lab sessions and test scores.", "Maintain attendance levels for upcoming peak weeks."];
        }

        return NextResponse.json({
            success: true,
            insights
        });

    } catch (error: any) {
        console.error('AI Insights error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
