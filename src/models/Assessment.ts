import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true }, // "AMCAT 1"
  type: { type: String, enum: ['INTERNAL', 'EXTERNAL', 'MOCK'], required: true },
  platform: { type: String }, // "HackerRank", "CoCubes"
  date_conducted: { type: Date, required: true },
  academic_year: { type: String, required: true }, // "2025-26"
  max_score: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
