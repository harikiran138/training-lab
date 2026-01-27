import mongoose from 'mongoose';

const FacultyAIInsightSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  strength_areas: [String],
  improvement_areas: [String],
  recommended_training: [String],
  best_suited_roles: [String], // e.g., ['CRT', 'Mentor', 'Subject Expert']
  impact_prediction: String,
  generated_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.FacultyAIInsight || mongoose.model('FacultyAIInsight', FacultyAIInsightSchema);
