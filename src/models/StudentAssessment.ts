import mongoose from 'mongoose';

const StudentAssessmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  score: { type: Number, default: 0 },
  percentile: { type: Number },
  attempt_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.StudentAssessment || mongoose.model('StudentAssessment', StudentAssessmentSchema);
