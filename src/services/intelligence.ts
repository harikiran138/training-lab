import Student from '@/models/Student';
import Placement from '@/models/Placement';
import ActivityLog from '@/models/ActivityLog';
import Recommendation from '@/models/Recommendation';
import { generateStructuredInsight } from './gemini';
import dbConnect from '@/lib/mongodb';

/**
 * Orchestrator to analyze a student's performance and generate/save AI insights
 */
export async function analyzeStudentPerformance(studentId: string) {
  await dbConnect();
  
  // 1. Fetch Student Data
  const student = await Student.findOne({ student_id: studentId }).lean();
  if (!student) throw new Error("Student not found");
  
  // 2. Fetch Recent Activities (Last 4 weeks)
  const activities = await ActivityLog.find({ 
    entity_id: studentId, 
    entity_type: 'Student' 
  }).sort({ date: -1 }).limit(20).lean();
  
  // 3. Fetch Placement Tracking
  const placements = await Placement.find({ student_id: studentId }).lean();
  
  // 4. Combine data for AI
  const analysisPayload = {
    profile: student,
    activities,
    placements
  };
  
  // 5. Generate AI Insight
  const aiResult = await generateStructuredInsight(analysisPayload, 'Student');
  
  if (aiResult) {
    // 6. Save Recommendation back to DB
    await Recommendation.findOneAndUpdate(
      { target_id: studentId, target_type: 'Student', is_active: true },
      {
        insight_text: aiResult.insight,
        action_plan: aiResult.action_items,
        risk_level: aiResult.risk_level,
        confidence_score: aiResult.priority_score,
        raw_data_snapshot: analysisPayload,
        is_active: true
      },
      { upsert: true, new: true }
    );
    
    // 7. Update Student's PRI and Risk Level
    await Student.findOneAndUpdate(
      { student_id: studentId },
      { 
        placement_readiness_index: aiResult.priority_score * 100,
        risk_level: aiResult.risk_level,
        last_ai_update: new Date()
      }
    );
  }
  
  return aiResult;
}

import { AI_POLICY } from '@/config/ai-policy';

/**
 * Logic-driven Priority Analyzer to complement AI insights
 */
export async function detectSystemPriorities(data: any) {
  const priorities: any[] = [];
  
  // 1. Critical Attendance Check
  if (data.profile?.attendance_discipline_score < AI_POLICY.RISK_THRESHOLDS.ATTENDANCE_CRITICAL) {
    priorities.push({
      task: "Urgent Counseling: Critical Attendance Drop",
      priority: "High"
    });
  }

  // 2. PRI Readiness Check
  if (data.profile?.year === 4 && data.profile?.placement_readiness_index < AI_POLICY.PLACEMENT_READINESS.PRI_MINIMUM) {
    priorities.push({
      task: "Mandatory Resume & Interview Prep",
      priority: "High"
    });
  }

  return priorities;
}

/**
 * Orchestrator to analyze branch/department level trends
 */
export async function analyzeDepartmentTrends(branchCode: string) {
  await dbConnect();
  
  // 1. Fetch Department Average Metrics
  const students = await Student.find({ branch_code: branchCode }).lean();
  const placementSummary = await Placement.aggregate([
    { $match: { student_id: { $in: students.map(s => s.student_id) } } },
    { $group: { _id: "$current_status", count: { $sum: 1 } } }
  ]);
  
  // 2. Fetch High-Activity Logs
  const recentLogs = await ActivityLog.find({
    tags: { $in: ['Mock_Test', 'Attendance'] }
  }).sort({ date: -1 }).limit(50).lean();

  const analysisPayload = {
    branch: branchCode,
    student_count: students.length,
    placements: placementSummary,
    recent_activity_level: recentLogs.length,
    high_risk_percentage: students.length > 0 
      ? (students.filter(s => s.risk_level === 'High').length / students.length) * 100 
      : 0
  };

  // 3. Generate AI Insight for the Department
  const aiResult = await generateStructuredInsight(analysisPayload, 'Department');

  if (aiResult) {
    // Merge AI insights with rule-based priority detection
    const rulePriorities = await detectSystemPriorities({ profile: { branch_code: branchCode }, students });
    
    await Recommendation.findOneAndUpdate(
      { target_id: branchCode, target_type: 'Department', is_active: true },
      {
        insight_text: aiResult.insight,
        action_plan: [...(aiResult.action_items || []), ...rulePriorities],
        risk_level: aiResult.risk_level,
        confidence_score: aiResult.priority_score,
        raw_data_snapshot: analysisPayload,
        is_active: true
      },
      { upsert: true, new: true }
    );
  }

  return aiResult;
}
