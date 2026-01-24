import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Placement from '@/models/Placement';
import Faculty from '@/models/Faculty';
import Class from '@/models/Class';
import Recommendation from '@/models/Recommendation';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { targetId, type } = await req.json(); // type: 'Student', 'Class', 'Department', 'College'
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // 1. Fetch Data Snapshot based on type
    let dataContext: any = {};
    
    if (type === 'Student') {
      const student = await Student.findOne({ student_id: targetId }).lean();
      const placements = await Placement.find({ student_id: targetId }).lean();
      dataContext = { student, placements };
    } else if (type === 'Class') {
      const classData = await Class.findOne({ class_id: targetId }).lean();
      const students = await Student.find({ branch_code: classData?.branch_code, section: classData?.section }).lean();
      const reports = await CRTWeeklyReport.find({ branch_code: classData?.branch_code }).sort({ week_no: -1 }).limit(5).lean();
      dataContext = { classData, students, reports };
    } else {
      // Default: College/Overall Dashboard Context
      const studentsCount = await Student.countDocuments();
      const placementStats = await Placement.aggregate([
        { $group: { _id: '$current_status', count: { $sum: 1 } } }
      ]);
      const facultyCount = await Faculty.countDocuments();
      const recentReports = await CRTWeeklyReport.find().sort({ createdAt: -1 }).limit(10).lean();
      dataContext = { studentsCount, placementStats, facultyCount, recentReports };
    }

    // 2. Construct Master Prompt
    const masterPrompt = `
      You are an AI Academic & Career Intelligence Engine for a college.
      
      CONVENIENCE DATA CONTEXT:
      ${JSON.stringify(dataContext, null, 2)}
      
      TASK:
      Analyze this real-time data and provide specialized intelligence based on the following role-based criteria:
      - Academic & Career Analysis
      - Risk Identification (🟢, 🟡, 🔴)
      - Actionable Recommendations
      - Placement Readiness Index (PRI) updates where applicable
      
      OUTPUT FORMAT (STRICT JSON):
      {
        "insight_text": "Executive summary of analysis",
        "risk_level": "Low" | "Medium" | "High",
        "recommendations": [
          { "task": "Specific action", "priority": "High" | "Medium" | "Low" }
        ],
        "metrics_update": {
           "placement_readiness_index": 0-100,
           "attendance_discipline_score": 0-100
        }
      }
    `;

    // 3. Call Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{
        parts: [{ text: masterPrompt }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const geminiData = await response.json();
    if (!response.ok) throw new Error(geminiData.error?.message || 'Gemini API Error');

    const aiResponseText = geminiData.candidates[0].content.parts[0].text;
    const aiResult = JSON.parse(aiResponseText.replace(/```json|```/g, '').trim());

    // 4. Persistence: Update Database
    if (type === 'Student' && targetId) {
      await Student.updateOne(
        { student_id: targetId },
        { 
          $set: { 
            placement_readiness_index: aiResult.metrics_update?.placement_readiness_index,
            risk_level: aiResult.risk_level,
            last_ai_update: new Date()
          } 
        }
      );
    } else if (type === 'College') {
      // Update AggregateSummary with the insights
      // In a real system, we might update specific branches, but for now we update a general record or all.
      // Let's assume we want to update the overall institution perspective or all active summaries.
      await mongoose.model('AggregateSummary').updateMany(
        {},
        { 
          $set: { 
            ai_risk_level: aiResult.risk_level,
            ai_recommendation: aiResult.insight_text
          } 
        }
      );
    }

    // Save Recommendation
    const newRecommendation = await Recommendation.create({
      target_id: targetId || 'college_overall',
      target_type: type,
      category: 'Academic',
      insight_text: aiResult.insight_text,
      action_plan: aiResult.recommendations.map((r: any) => ({
        task: r.task,
        priority: r.priority
      })),
      risk_level: aiResult.risk_level,
      confidence_score: 0.95,
      raw_data_snapshot: dataContext,
      is_active: true
    });

    return NextResponse.json({
      success: true,
      result: aiResult,
      recommendationId: newRecommendation._id
    });

  } catch (error: any) {
    console.error('AI Intelligence Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
