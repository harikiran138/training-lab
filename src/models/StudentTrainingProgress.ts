import mongoose from 'mongoose';

const StudentTrainingProgressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingModule', required: true, index: true },
  completion_percent: { type: Number, default: 0 },
  assessment_score: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started' 
  },
  last_accessed: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.StudentTrainingProgress || mongoose.model('StudentTrainingProgress', StudentTrainingProgressSchema);
