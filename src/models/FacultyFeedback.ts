import mongoose from 'mongoose';

const FacultyFeedbackSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: String,
  submitted_on: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.FacultyFeedback || mongoose.model('FacultyFeedback', FacultyFeedbackSchema);
