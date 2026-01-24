import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  faculty_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String },
  
  specializations: [String],
  
  performance_metrics: {
    avg_student_improvement: { type: Number, default: 0 },
    avg_pass_percentage: { type: Number, default: 0 },
    student_rating: { type: Number, default: 0 }
  },
  
  experience_years: { type: Number },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
