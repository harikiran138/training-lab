import mongoose from 'mongoose';

const PlacementSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.String, ref: 'Student', required: true },
  company_name: { type: String, required: true },
  job_role: { type: String },
  job_type: { type: String, enum: ['Full-time', 'Internship', 'Contract'], default: 'Full-time' },
  location: { type: String },
  ctc_package: { type: Number }, // In LPA
  
  source: { type: String, default: 'Campus' }, // Campus, Off-campus, Referral
  
  current_status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'OA_Cleared', 'Technical_Round', 'HR_Round', 'Offered', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  
  interview_rounds: [{
    round_type: String, // OA, Group Discussion, Technical, HR
    status: { type: String, enum: ['Pending', 'Cleared', 'Failed'] },
    date: Date,
    feedback: String
  }],
  
  application_date: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  
  // Professional tracking
  email_communication_logs: [{
    subject: String,
    snippet: String,
    timestamp: Date,
    sentiment: String // Positive, Neutral, Negative
  }]
}, {
  timestamps: true
});

export default mongoose.models.Placement || mongoose.model('Placement', PlacementSchema);
