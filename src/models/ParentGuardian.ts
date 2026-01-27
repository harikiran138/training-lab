import mongoose from 'mongoose';

const ParentGuardianSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  
  // Parents
  father_name: String,
  father_occupation: String,
  father_mobile: String,
  father_email: String,
  
  mother_name: String,
  mother_occupation: String,
  mother_mobile: String,
  mother_email: String,
  
  annual_income: Number,

  // Guardian (Optional or if parents unavailable)
  guardian_name: String,
  guardian_relation: String,
  guardian_address: String,
  guardian_mobile: String
}, {
  timestamps: true
});

export default mongoose.models.ParentGuardian || mongoose.model('ParentGuardian', ParentGuardianSchema);
