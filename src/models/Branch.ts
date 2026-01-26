import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  branch_code: string;
  branch_name: string;
  department: string;
  current_strength: number;
}

const BranchSchema: Schema = new Schema({
  branch_code: { type: String, required: true, unique: true }, // "CSE-A"
  branch_name: { type: String, required: true },
  department: { type: String, required: true }, // "CSE"
  current_strength: { type: Number, default: 0 },
  deleted_at: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
