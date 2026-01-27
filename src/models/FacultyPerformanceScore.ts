import mongoose from 'mongoose';

const FacultyPerformanceScoreSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  teaching_score: { type: Number, default: 0 },
  student_feedback_score: { type: Number, default: 0 },
  crt_effectiveness_score: { type: Number, default: 0 },
  placement_contribution_score: { type: Number, default: 0 },
  engagement_score: { type: Number, default: 0 },
  overall_score: { type: Number, default: 0 },
  faculty_grade: { type: String, enum: ['A+', 'A', 'B', 'C', 'D'], default: 'B' }
}, {
  timestamps: true
});

export default mongoose.models.FacultyPerformanceScore || mongoose.model('FacultyPerformanceScore', FacultyPerformanceScoreSchema);
