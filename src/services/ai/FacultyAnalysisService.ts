import dbConnect from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import FacultyEducation from '@/models/FacultyEducation';
import FacultySubject from '@/models/FacultySubject';
import Timetable from '@/models/Timetable';
import FacultyStudentInteraction from '@/models/FacultyStudentInteraction';
import FacultyClassStat from '@/models/FacultyClassStat';
import FacultyCRTSession from '@/models/FacultyCRTSession';
import FacultyTrainingOutcome from '@/models/FacultyTrainingOutcome';
import FacultyFeedback from '@/models/FacultyFeedback';
import FacultyPlacementImpact from '@/models/FacultyPlacementImpact';
import FacultyPerformanceScore from '@/models/FacultyPerformanceScore';
import FacultyAIInsight from '@/models/FacultyAIInsight';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function analyzeFacultyExtended(facultyIdString: string) {
  await dbConnect();

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });

  // 1. GATHER COMPLETE FACULTY DATA
  const faculty = await Faculty.findOne({ faculty_id: facultyIdString }).lean();
  if (!faculty) throw new Error("Faculty not found");

  const education = await FacultyEducation.find({ faculty_id: faculty._id }).lean();
  const subjects = await FacultySubject.find({ faculty_id: faculty._id }).lean();
  const interactions = await FacultyStudentInteraction.find({ faculty_id: faculty._id }).limit(50).lean();
  const classStats = await FacultyClassStat.find({ faculty_id: faculty._id }).lean();
  const crtSessions = await FacultyCRTSession.find({ faculty_id: faculty._id }).lean();
  const trainingOutcomes = await FacultyTrainingOutcome.find({ faculty_id: faculty._id }).lean();
  const feedback = await FacultyFeedback.find({ faculty_id: faculty._id }).limit(50).lean();
  const placementImpact = await FacultyPlacementImpact.find({ faculty_id: faculty._id }).lean();

  const payload = {
    profile: faculty,
    education,
    subjects,
    interactions,
    classStats,
    crtSessions,
    trainingOutcomes,
    feedback,
    placementImpact
  };

  // 2. FACULTY AI PROMPT
  const systemPrompt = `
    You are an AI Faculty Performance & CRT Impact Analyst.
    Your task is to analyze faculty data and provide a quantitative and qualitative effectiveness report.
    Use factual data only. Output structured JSON ONLY.
  `;

  const userPrompt = `
    Input:
    - Faculty profile, subjects, student interactions, CRT sessions, placement outcomes, and feedback.
    
    Data: ${JSON.stringify(payload)}

    Tasks:
    1. Measure faculty teaching effectiveness.
    2. Correlate teaching & CRT impact with student placements.
    3. Identify strengths and improvement areas.
    4. Recommend: Training, optimal subject allocation, and best-suited roles (CRT/Mentor/Expert).
    5. Predict impact on future placement cohorts.

    Output Format:
    {
      "overall_effectiveness": "0-100",
      "strength_areas": [],
      "improvement_areas": [],
      "recommended_training": [],
      "best_suited_roles": [],
      "impact_prediction": "Concise summary",
      "performance_grade": "A+/A/B/C/D"
    }
  `;

  try {
    const { text } = await generateText({
      model: google('gemini-pro-latest'),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    // Clean JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    const aiData = JSON.parse(cleanJson);

    // 3. PERSIST AI INSIGHT
    const insight = await FacultyAIInsight.create({
      faculty_id: faculty._id,
      strength_areas: aiData.strength_areas,
      improvement_areas: aiData.improvement_areas,
      recommended_training: aiData.recommended_training,
      best_suited_roles: aiData.best_suited_roles,
      impact_prediction: aiData.impact_prediction,
      generated_at: new Date()
    });

    // 4. Update Performance Score
    await FacultyPerformanceScore.findOneAndUpdate(
      { faculty_id: faculty._id },
      {
        overall_score: parseInt(aiData.overall_effectiveness) || 0,
        faculty_grade: aiData.performance_grade || 'B',
        crt_effectiveness_score: parseInt(aiData.overall_effectiveness) * 0.8 // Dummy calculation
      },
      { upsert: true }
    );

    return { insight, aiData };
  } catch (error) {
    console.error("Faculty AI Analysis Error:", error);
    throw error;
  }
}
