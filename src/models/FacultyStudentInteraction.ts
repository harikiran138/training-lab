import mongoose from 'mongoose';

const FacultyStudentInteractionSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  interaction_type: { 
    type: String, 
    enum: ['Class', 'Mentoring', 'CRT', 'Doubt Session'], 
    required: true 
  },
  date: { type: Date, default: Date.now },
  duration_minutes: Number,
  remarks: String
}, {
  timestamps: true
});

export default mongoose.models.FacultyStudentInteraction || mongoose.model('FacultyStudentInteraction', FacultyStudentInteractionSchema);
