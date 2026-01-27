import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  event_name: { type: String, required: true },
  type: { type: String, enum: ['Hackathon', 'Workshop', 'Seminar'], required: true },
  role: String,
  achievement: String,
  date: Date
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
