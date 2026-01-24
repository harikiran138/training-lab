import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicBatch extends Document {
  batch_name: string; // e.g., "3-2 (2027)"
  year: number;       // e.g., 3
  semester: number;   // e.g., 2
  academic_year: string; // e.g., "2026-2027"
  is_active: boolean;
}

const AcademicBatchSchema: Schema = new Schema({
  batch_name: { type: String, required: true, unique: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  academic_year: { type: String, required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.AcademicBatch || mongoose.model<IAcademicBatch>('AcademicBatch', AcademicBatchSchema);
