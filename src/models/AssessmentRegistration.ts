import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentRegistration extends Document {
  branch_id: mongoose.Types.ObjectId;
  academic_year: string;
  date_logged: Date;
  
  total_strength: number;
  registered_count: number;
  not_registered_count: number;
  registration_percentage: number;
  
  created_at: Date;
}

const AssessmentRegistrationSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  academic_year: { type: String, required: true },
  date_logged: { type: Date, required: true },

  total_strength: { type: Number, required: true },
  registered_count: { type: Number, required: true },
  not_registered_count: { type: Number, required: true }, // Derived but stored for snapshot
  registration_percentage: { type: Number, required: true }
}, { timestamps: true });

// Ensure we don't have duplicate snapshots for the same day/branch
AssessmentRegistrationSchema.index({ branch_id: 1, date_logged: 1 }, { unique: true });

export default mongoose.models.AssessmentRegistration || mongoose.model<IAssessmentRegistration>('AssessmentRegistration', AssessmentRegistrationSchema);
