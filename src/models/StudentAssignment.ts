import mongoose from 'mongoose';

const StudentAssignmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  score: { type: Number, default: 0 },
  submission_date: { type: Date, default: Date.now },
  feedback: String
}, {
  timestamps: true
});

export default mongoose.models.StudentAssignment || mongoose.model('StudentAssignment', StudentAssignmentSchema);
