import mongoose from 'mongoose';

const TrainingModuleSchema = new mongoose.Schema({
  module_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  module_name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Aptitude', 'Reasoning', 'Verbal', 'Coding', 'Soft Skills', 'Technical'],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  duration_hours: Number,
  description: String
}, {
  timestamps: true
});

export default mongoose.models.TrainingModule || mongoose.model('TrainingModule', TrainingModuleSchema);
