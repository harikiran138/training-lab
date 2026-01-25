import mongoose from 'mongoose';

const FacultyCertificationSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  certification_name: { type: String, required: true },
  platform: String,
  issue_date: Date,
  credential_url: String
}, {
  timestamps: true
});

export default mongoose.models.FacultyCertification || mongoose.model('FacultyCertification', FacultyCertificationSchema);
