import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/ai/client';
import { getSession } from '@/lib/auth';
import { generatePredictions } from '@/services/InsightService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

        // Fetch Trend Data from NestJS Backend
        const trendsRes = await fetch(`${backendUrl}/analytics/trends`, { cache: 'no-store' });

        if (!trendsRes.ok) {
            return NextResponse.json({
                success: true,
                insights: ["System is synchronizing data. AI insights will be available shortly."]
            });
        }

        const trendData = await trendsRes.json();

        if (!Array.isArray(trendData) || trendData.length < 2) {
            return NextResponse.json({
                success: true,
                insights: ["Insufficient trend data to generate AI insights. Please wait for more weekly reports."]
            });
        }

        // Prepare data for Gemini context
        // Backend returns: { period: date, attendance: number, average_score: number }
        const simplifiedContext = trendData.map((d: any) => ({
            week: d.period ? `W${new Date(d.period).toISOString().slice(0, 10)}` : 'W?',
            attendance: Math.round(d.attendance || 0),
            pass: Math.round(d.average_score || 0)
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
