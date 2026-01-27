import mongoose from 'mongoose';

const FacultyClassStatSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  subject_name: { type: String, required: true },
  semester: Number,
  average_attendance: { type: Number, default: 0 },
  average_marks: { type: Number, default: 0 },
  pass_percentage: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.FacultyClassStat || mongoose.model('FacultyClassStat', FacultyClassStatSchema);
