import mongoose from 'mongoose';

const StudentAssessmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  
  selection_status: { type: String, enum: ['CLEARED', 'FAILED', 'ABSENT'] },
  score_obtained: { type: Number, default: 0 },
  percentile: { type: Number },
  
  attempt_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Avoid duplicate entries for same student-assessment pair
StudentAssessmentSchema.index({ student_id: 1, assessment_id: 1 }, { unique: true });

export default mongoose.models.StudentAssessment || mongoose.model('StudentAssessment', StudentAssessmentSchema);
