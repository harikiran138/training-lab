import mongoose from 'mongoose';

const StudentSubjectSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  attendance_percentage: { type: Number, default: 0 },
  internal_marks: { type: Number, default: 0 },
  external_marks: { type: Number, default: 0 },
  status: { type: String, enum: ['Passed', 'Failed', 'Ongoing'], default: 'Ongoing' }
}, {
  timestamps: true
});

export default mongoose.models.StudentSubject || mongoose.model('StudentSubject', StudentSubjectSchema);
