import mongoose, { Schema } from 'mongoose';

const PlacementSchema = new Schema({
  student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  drive_id: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
  
  // Snapshot data (historical record even if drive changes)
  job_role_applied: { type: String },
  
  current_status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'OA_Cleared', 'Technical_Round', 'HR_Round', 'Offered', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  
  // Detailed Round Tracking
  interview_rounds: [{
    round_type: { type: String }, // OA, GD, Tech, HR
    status: { type: String, enum: ['Pending', 'Cleared', 'Failed'] },
    date: { type: Date },
    feedback: { type: String }
  }],
  
  offer_letter_url: { type: String },
  ctc_offered: { type: Number }, // Actual CTC if offered
  
  application_date: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Unique application per student per drive
PlacementSchema.index({ student_id: 1, drive_id: 1 }, { unique: true });

export default mongoose.models.Placement || mongoose.model('Placement', PlacementSchema);
