import mongoose from 'mongoose';

const CertificationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  platform: String,
  issue_date: Date,
  credential_url: String
}, {
  timestamps: true
});

export default mongoose.models.Certification || mongoose.model('Certification', CertificationSchema);
