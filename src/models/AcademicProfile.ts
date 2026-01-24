import mongoose from 'mongoose';

const AcademicProfileSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  current_semester: { type: Number, required: true },
  total_semesters: { type: Number, default: 8 },
  cgpa: { type: Number, default: 0 },
  ssc_marks: { type: Number },
  ssc_percentage: { type: Number },
  inter_marks: { type: Number },
  inter_percentage: { type: Number },
  entrance_exam: { type: String },
  entrance_rank: { type: Number },
  last_studied_institution: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.AcademicProfile || mongoose.model('AcademicProfile', AcademicProfileSchema);
