import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['CRT', 'Subject', 'Coding'], required: true },
  max_score: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
