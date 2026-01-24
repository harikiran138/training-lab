import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  entity_id: { type: String, required: true }, // Can be student_id or class_id
  entity_type: { type: String, enum: ['Student', 'Class'], required: true },
  
  activity_type: { 
    type: String, 
    enum: ['Attendance', 'Mock_Test', 'Internal_Exam', 'Skill_Assessment', 'Resume_Review'], 
    required: true 
  },
  
  description: { type: String },
  
  // Quantitative Data
  metrics: {
    score: Number,
    max_score: Number,
    percentage: Number,
    duration_minutes: Number,
    status: String // Present, Absent, Completed, Failed
  },
  
  // Metadata for AI
  tags: [String], // "DSA", "Communications", "Aptitude"
  week_no: { type: Number },
  date: { type: Date, default: Date.now },
  
  performed_by: { type: String } // e.g., faculty_id or "System"
}, {
  timestamps: true
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
