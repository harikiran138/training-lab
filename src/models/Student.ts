import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true }, // Mapping to roll_no/admission_no for legacy support
  admission_no: { type: String, unique: true, sparse: true },
  roll_no: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  date_of_birth: { type: Date },
  nationality: { type: String },
  religion: { type: String },
  caste: { type: String },
  seat_type: { type: String },
  aadhaar_no: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  mobile_no: { type: String },
  alternate_mobile: { type: String },
  bank_account_no: { type: String },
  ration_card_no: { type: String },
  joining_date: { type: Date },
  current_status: { 
    type: String, 
    enum: ['Active', 'Alumni', 'Dropout'], 
    default: 'Active' 
  },

  // Academic Context (Synced from AcademicProfile)
  branch_code: { type: String }, // Links to Branch model
  section: { type: String },
  year: { type: Number },
  current_semester: { type: Number },
  
  // Performance & AI Insights
  attendance_discipline_score: { type: Number, default: 0 },
  academic_gpa: { type: Number, default: 0 },
  resume_score: { type: Number, default: 0 },
  placement_readiness_index: { type: Number, default: 0 },
  
  tags: [String], // DSA, MERN, etc.
  risk_level: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Low' 
  },
  
  last_ai_update: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
