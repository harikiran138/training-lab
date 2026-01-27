import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  skill_name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Technical', 'Soft', 'Aptitude'], required: true }
}, {
  timestamps: true
});

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
