import mongoose from 'mongoose';

const RiskFlagSchema = new mongoose.Schema({
  flag_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true, index: true },
  
  risk_type: { 
    type: String, 
    enum: [
      'Low_Attendance', 
      'Academic_Failure', 
      'Skill_Stagnation', 
      'No_Internship', 
      'Behavioral', 
      'Fee_Due'
    ], 
    required: true 
  },
  
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  status: { type: String, enum: ['Active', 'Resolved', 'Ignored'], default: 'Active' },
  
  triggered_by: { type: String, default: 'System_AI' }, // 'System_AI' or FacultyID
  triggered_on: { type: Date, default: Date.now },
  
  details: { type: String }, // "Attendance dropped below 60%"
  
  resolution_notes: { type: String },
  resolved_by: { type: String },
  resolved_at: { type: Date }
}, {
  timestamps: true
});

RiskFlagSchema.index({ student_id: 1, status: 1 });

export default mongoose.models.RiskFlag || mongoose.model('RiskFlag', RiskFlagSchema);
