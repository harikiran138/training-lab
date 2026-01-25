import mongoose from 'mongoose';

const FacultySubjectSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  subject_name: { type: String, required: true },
  course: String,
  branch: String,
  semester: Number,
  academic_year: String
}, {
  timestamps: true
});

export default mongoose.models.FacultySubject || mongoose.model('FacultySubject', FacultySubjectSchema);
