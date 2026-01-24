import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  round_name: { type: String, required: true },
  result: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' },
  remarks: String
});

const JobApplicationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  company_name: { type: String, required: true },
  job_role: { type: String, required: true },
  package_lpa: Number,
  application_date: { type: Date, default: Date.now },
  application_mode: { type: String, enum: ['Email', 'Portal', 'Referral', 'Campus'] },
  current_round: String,
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'], 
    default: 'Applied' 
  },
  rounds: [RoundSchema]
}, {
  timestamps: true
});

export default mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
