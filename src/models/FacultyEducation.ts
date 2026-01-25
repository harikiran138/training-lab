import mongoose from 'mongoose';

const FacultyEducationSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  degree: { type: String, required: true },
  specialization: String,
  institution: String,
  year_of_passing: Number
}, {
  timestamps: true
});

export default mongoose.models.FacultyEducation || mongoose.model('FacultyEducation', FacultyEducationSchema);
