import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  branch_code: { type: String, required: true }, // Links to Branch
  section: { type: String },
  year: { type: Number, required: true },
  current_semester: { type: Number },
  
  // Discipline & Academic
  attendance_discipline_score: { type: Number, default: 0 }, // 0-100
  academic_gpa: { type: Number, default: 0 },
  
  // Skills & Proficiency
  skills: [{
    skill_name: String,
    proficiency_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    last_assessed: Date
  }],
  certifications: [{
    title: String,
    provider: String,
    date_obtained: Date,
    url: String
  }],
  
  // Placement Readiness
  resume_score: { type: Number, default: 0 },
  placement_readiness_index: { type: Number, default: 0 }, // AI Generated PRI
  tags: [String], // DSA, MERN, Cloud, etc.
  
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
