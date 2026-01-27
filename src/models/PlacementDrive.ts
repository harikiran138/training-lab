import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacementDrive extends Document {
  company_name: string;
  drive_date: Date;
  job_roles: string[];
  ctc_range: string;
  eligibility_criteria: string;
  academic_year: string;
  job_location?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  created_at: Date;
  updated_at: Date;
}

const PlacementDriveSchema = new Schema({
  company_name: { type: String, required: true },
  drive_date: { type: Date, required: true },
  job_roles: [{ type: String }], // e.g., ["SDE", "Tester"]
  ctc_range: { type: String }, // "4-6 LPA"
  eligibility_criteria: { type: String }, // "CSE, >60%"
  job_location: { type: String },
  academic_year: { type: String, required: true }, // "2025-26"
  
  status: { 
    type: String, 
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

export default mongoose.models.PlacementDrive || mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);
