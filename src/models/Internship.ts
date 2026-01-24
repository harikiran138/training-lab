import mongoose from 'mongoose';

const InternshipSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  company_name: { type: String, required: true },
  role: String,
  duration: String,
  stipend: Number,
  mode: { type: String, enum: ['Online', 'Offline'] },
  status: { type: String, enum: ['Applied', 'Ongoing', 'Completed'], default: 'Applied' },
  offer_letter_url: String
}, {
  timestamps: true
});

export default mongoose.models.Internship || mongoose.model('Internship', InternshipSchema);
