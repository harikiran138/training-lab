import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import AcademicProfile from '@/models/AcademicProfile';
import Subject from '@/models/Subject';
import StudentSubject from '@/models/StudentSubject';
import Skill from '@/models/Skill';
import StudentSkill from '@/models/StudentSkill';
import Project from '@/models/Project';
import Assignment from '@/models/Assignment';
import StudentAssignment from '@/models/StudentAssignment';
import Assessment from '@/models/Assessment';
import StudentAssessment from '@/models/StudentAssessment';
import Internship from '@/models/Internship';
import JobApplication from '@/models/JobApplication';
import PerformanceScore from '@/models/PerformanceScore';
import AIRecommendation from '@/models/AIRecommendation';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function analyzeStudentExtended(studentId: string) {
  await dbConnect();

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });
  
  // Force registration
  const _models = [Subject, Skill, Assignment, Assessment]; 

  // 1. GATHER COMPLETE DATA
  const student = await Student.findOne({ student_id: studentId }).lean();
  if (!student) throw new Error("Student not found");

  const academic = await AcademicProfile.findOne({ student_id: student._id }).lean();
  const subjects = await StudentSubject.find({ student_id: student._id }).populate('subject_id').lean();
  const skills = await StudentSkill.find({ student_id: student._id }).populate('skill_id').lean();
  const projects = await Project.find({ student_id: student._id }).lean();
  const assignments = await StudentAssignment.find({ student_id: student._id }).populate('assignment_id').lean();
  const assessments = await StudentAssessment.find({ student_id: student._id }).populate('assessment_id').lean();
  const internships = await Internship.find({ student_id: student._id }).lean();
  const jobApplications = await JobApplication.find({ student_id: student._id }).lean();
  const scores = await PerformanceScore.findOne({ student_id: student._id }).lean();

  const payload = {
    profile: student,
    academic,
    subjects,
    skills,
    projects,
    assignments,
    assessments,
    internships,
    jobApplications,
    scores
  };

  // 2. MASTER AI PROMPT
  const systemPrompt = `
    You are an AI CRT Training & Placement Analyst.
    Use factual student data only. Avoid hallucination. Output structured JSON ONLY.
  `;

  const userPrompt = `
    Input:
    - Complete student academic, skills, projects, assessments, internships, and job application data.
    
    Data: ${JSON.stringify(payload)}

    Tasks:
    1. Analyze student readiness for internships and placements.
    2. Identify skill gaps for target job roles.
    3. Recommend: Subjects to focus, Skills to improve, Projects to build, Internships to apply.
    4. Predict placement probability (%).
    5. Suggest personalized weekly training plan.
    6. Assessment results analysis.

    Output Format:
    {
      "overall_score": "0-100",
      "strengths": [],
      "weaknesses": [],
      "recommended_roles": [],
      "skill_gaps": [],
      "training_plan": {"week1": "...", "week2": "..."},
      "placement_probability": "0-100%"
    }
  `;

  try {
    const { text } = await generateText({
      model: google('gemini-pro'),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    // Clean JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    const aiData = JSON.parse(cleanJson);

    // 3. PERSIST RECOMMENDATION
    const recommendation = await AIRecommendation.create({
      student_id: student._id,
      recommended_roles: aiData.recommended_roles,
      skill_gaps: aiData.skill_gaps,
      suggested_courses: aiData.training_plan ? Object.values(aiData.training_plan) : [],
      internship_readiness: parseInt(aiData.overall_score) > 70,
      placement_probability: aiData.placement_probability,
      training_plan: aiData.training_plan,
      generated_at: new Date()
    });

    // 4. Update Student & Performance Score
    await Student.findByIdAndUpdate(student._id, {
      placement_readiness_index: parseInt(aiData.placement_probability) || 0,
      last_ai_update: new Date()
    });

    if (scores) {
      await PerformanceScore.findByIdAndUpdate(scores._id, {
        overall_score: parseInt(aiData.overall_score) || 0,
        ai_readiness_grade: parseInt(aiData.overall_score) > 90 ? 'A' : parseInt(aiData.overall_score) > 75 ? 'B' : parseInt(aiData.overall_score) > 60 ? 'C' : 'D'
      });
    }

    return { recommendation, aiData };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
