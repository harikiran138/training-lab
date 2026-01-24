import mongoose from 'mongoose';

const AIRecommendationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  recommended_roles: [String],
  skill_gaps: [String],
  suggested_courses: [String],
  internship_readiness: { type: Boolean, default: false },
  placement_probability: { type: String }, // Percentage as string or number
  training_plan: { type: mongoose.Schema.Types.Mixed }, // Structured JSON
  generated_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.AIRecommendation || mongoose.model('AIRecommendation', AIRecommendationSchema);
