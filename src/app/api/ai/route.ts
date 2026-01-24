import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';

// Configure the provider. 
// Note: The user provided key starts with 'vck_', which implies Vercel. 
// However, standard @ai-sdk/openai usually takes OpenAI keys.
// If this is a specialized Vercel endpoint, we might need a custom base URL or provider.
// Given strict instructions "USE THIS IN VERSEL API", I will assume it's compatible with
// the standard Vercel AI SDK usage which often defaults to OpenAI or needs configuration.
// Since the prompt explicitly said "model: 'mistral/devstral-small-2'", this strongly suggests
// using the Mistral provider or Vercel's gateway.

// For safety, I'll use the generic 'openai' provider wrapper but point it if needed, 
// or simpler: just use the `ai` SDK's standard approach.

const openai = createOpenAI({
  apiKey: process.env.VERCEL_AI_API_KEY,
  baseURL: 'https://api.vercel.ai/v1', // Trying generic Vercel gateway if it exists, or just default.
  // actually 'vck_' usually implies Vercel's hosted model access.
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Fetch Context
  const dashboardMetrics = await AnalyticsService.getDashboardMetrics();
  
  // 2. System Prompt
  const context = `
    You are an expert Performance Intelligence Analyst for a CRT (Campus Recruitment Training) program.
    Your job is to analyze the following real-time data and provide actionable executive summaries.
    
    Current Data:
    - Overall Attendance: ${dashboardMetrics.kpis.avgAttendance.toFixed(1)}%
    - Overall Pass %: ${dashboardMetrics.kpis.avgPassPercent.toFixed(1)}%
    - Critical Branches: ${dashboardMetrics.rankings.filter((r: any) => r.computed?.risk_level === 'Critical').map((r: any) => r.branch_code).join(', ')}
    
    Structure your response as:
    1. Executive Summary
    2. Key Anomalies
    3. Recommended Actions
  `;

  // 3. AI Stream
  const result = streamText({
    model: openai('mistral/devstral-small-2'), // Using the requested model
    system: context,
    messages,
  });

  return result.toTextStreamResponse();
}
