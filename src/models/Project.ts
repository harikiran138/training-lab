import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  tech_stack: [String],
  github_link: String,
  live_link: String,
  role: String,
  start_date: Date,
  end_date: Date,
  evaluation_score: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
