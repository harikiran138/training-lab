import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  assessment_name: { type: String, required: true },
  type: { type: String, enum: ['Aptitude', 'Coding', 'English', 'Mock Interview'], required: true },
  max_score: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
