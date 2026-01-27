import mongoose from 'mongoose';

const SelectionRoundSchema = new mongoose.Schema({
  round_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  job_application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication', required: true, index: true },
  round_name: { type: String, required: true }, // e.g., "Online Coding", "HR Interview"
  round_type: { 
    type: String, 
    enum: ['Aptitude', 'Coding', 'Group Discussion', 'Technical', 'HR', 'Managerial'], 
    required: true
  },
  score: Number,
  result: { 
    type: String, 
    enum: ['Qualified', 'Eliminated', 'Pending', 'Waitlisted'], 
    default: 'Pending' 
  },
  remarks: String,
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.SelectionRound || mongoose.model('SelectionRound', SelectionRoundSchema);
