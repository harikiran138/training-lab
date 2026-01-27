import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  doc_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  owner_id: { type: String, required: true, index: true }, // StudentID or FacultyID
  owner_role: { type: String, enum: ['Student', 'Faculty'], required: true },
  
  doc_type: { 
    type: String, 
    enum: [
      'Offer_Letter', 
      'Internship_Letter', 
      'Bonafide_Certificate', 
      'LOR', 
      'NOC', 
      'Resume', 
      'ID_Proof',
      'Academic_Transcript',
      'Other'
    ], 
    required: true 
  },
  
  file_url: { type: String, required: true },
  file_name: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected', 'Expired'], 
    default: 'Pending' 
  },
  
  verified_by: { type: String }, // Admin/Faculty ID
  verified_at: { type: Date },
  rejection_reason: { type: String },
  
  uploaded_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
