import mongoose from 'mongoose';

const StudentSkillSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  skill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
  proficiency_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.StudentSkill || mongoose.model('StudentSkill', StudentSkillSchema);
