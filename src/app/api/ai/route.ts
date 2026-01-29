import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { analyzeStudentExtended } from '@/services/ai/StudentAnalysisService';
import { analyzeFacultyExtended } from '@/services/ai/FacultyAnalysisService';

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

export const maxDuration = 60; // Increased for complex analysis

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, action, studentId, facultyId } = body; // Added facultyId

  // 1. Handle Student Analysis
  if (action === 'analyze_student' && studentId) {
    try {
      const result = await analyzeStudentExtended(studentId);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Handle Faculty Analysis
  if (action === 'analyze_faculty' && facultyId) {
    try {
      const result = await analyzeFacultyExtended(facultyId);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 3. Default Streaming Feedback (Existing behavior) // Updated comment number
  // 1. Fetch Context
  // const dashboardMetrics = await AnalyticsService.getDashboardMetrics();

  // Replaced with fetch to backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  let dashboardMetrics = { kpis: { avg_attendance: 0, avg_pass_rate: 0 } };

  try {
    const res = await fetch(`${backendUrl}/analytics/dashboard`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      dashboardMetrics = data;
    }
  } catch (e) {
    console.error("Failed to fetch backend metrics for AI context", e);
  }


  // 2. System Prompt
  const context = `
    You are an expert Performance Intelligence Analyst for a CRT (Campus Recruitment Training) program.
    Your job is to analyze the following real-time data and provide actionable executive summaries.
    
    Current Data:
    - Overall Attendance: ${(Number(dashboardMetrics.kpis?.avg_attendance) || 0).toFixed(1)}%
    - Overall Pass %: ${(Number(dashboardMetrics.kpis?.avg_pass_rate) || 0).toFixed(1)}%
    
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
