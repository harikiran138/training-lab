import mongoose from 'mongoose';

const PerformanceScoreSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  aptitude_score: { type: Number, default: 0 },
  coding_score: { type: Number, default: 0 },
  communication_score: { type: Number, default: 0 },
  attendance_score: { type: Number, default: 0 },
  project_score: { type: Number, default: 0 },
  overall_score: { type: Number, default: 0 },
  ai_readiness_grade: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'D' }
}, {
  timestamps: true
});

export default mongoose.models.PerformanceScore || mongoose.model('PerformanceScore', PerformanceScoreSchema);
