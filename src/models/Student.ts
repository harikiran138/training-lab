import mongoose, { Schema } from 'mongoose';

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true }, // Mapping to roll_no/admission_no for legacy support
  admission_no: { type: String, unique: true, sparse: true },
  roll_no: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  date_of_birth: { type: Date },
  
  // Contact
  email: { type: String, unique: true, sparse: true },
  mobile_no: { type: String },

  // Academic Context (Referential Integrity)
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  branch_code: { type: String }, // Denormalized for display (e.g., "CSE-A")
  
  section: { type: String },
  current_year: { type: Number },
  current_semester: { type: Number },
  current_batch: { type: String }, // "3-2"
  
  // Performance & AI Insights
  attendance_discipline_score: { type: Number, default: 0 },
  academic_gpa: { type: Number, default: 0 },
  resume_score: { type: Number, default: 0 },
  
  // V2: Derived Analytics
  latest_placement_readiness: { type: Number, default: 0 },
  attendance_risk_flag: { type: String, enum: ['RED', 'AMBER', 'GREEN'], default: 'GREEN' },
  
  tags: [String], // DSA, MERN, etc.
  
  last_ai_update: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
