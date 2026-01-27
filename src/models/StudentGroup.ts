import mongoose from 'mongoose';

const StudentGroupSchema = new mongoose.Schema({
  group_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', index: true }, // Optional mentor/lead
  group_name: { type: String, required: true },
  purpose: { 
    type: String, 
    enum: ['Mentorship', 'CRT Batch', 'Project', 'Remedial', 'Interest Group'], 
    required: true 
  },
  created_by: String, // Admin or Faculty ID
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.StudentGroup || mongoose.model('StudentGroup', StudentGroupSchema);
