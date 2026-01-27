import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  subject_name: { type: String, required: true },
  category: { type: String, enum: ['Core', 'CRT', 'Soft Skills'], required: true },
  semester: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
