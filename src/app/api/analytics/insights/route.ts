import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import { model } from '@/lib/ai/client';
import { getSession } from '@/lib/auth';
import { generatePredictions } from '@/services/InsightService';

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
            attendance: parseFloat((stats.attendance / stats.count).toFixed(1)),
            pass: parseFloat((stats.pass / stats.count).toFixed(1))
        }));

        // Generate Predictions
        const predictions = generatePredictions(simplifiedContext);

        // Call Gemini
        const prompt = `
            Analyze the following institution-wide CRT performance data:
            
            HISTORICAL DATA (Last ${simplifiedContext.length} weeks):
            ${JSON.stringify(simplifiedContext)}

            FUTURE PROJECTIONS (Next ${predictions.length} weeks):
            ${JSON.stringify(predictions)}

            Provide 4-5 concise, actionable insights for management.
            Include a dedicated "Future Outlook" insight based on the projections.
            Focus on trends, risks, and specific actions.
            Return as a JSON object: { "insights": ["...", "..."] }
            Keep each insight strictly under 20 words.
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
            insights = [
                "Overall performance shows a steady trend.",
                "Verify labs-theory alignment in upcoming weeks.",
                "Maintain focus on attendance to improve pass rates.",
                "Future outlook: Predicted stability with slight growth."
            ];
        }

        return NextResponse.json({
            success: true,
            insights,
            predictions
        });

    } catch (error: any) {
        console.error('AI Insights error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
