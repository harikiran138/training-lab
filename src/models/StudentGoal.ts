import mongoose from 'mongoose';

const StudentGoalSchema = new mongoose.Schema({
  goal_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  career_goal: { type: String, required: true }, // e.g. "Full Stack Developer"
  dream_company: String,
  target_role: String,
  target_package_lpa: Number,
  timeline_months: Number,
  status: { 
    type: String, 
    enum: ['In Progress', 'Achieved', 'Abandoned'], 
    default: 'In Progress' 
  }
}, {
  timestamps: true
});

export default mongoose.models.StudentGoal || mongoose.model('StudentGoal', StudentGoalSchema);
