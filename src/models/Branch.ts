import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  branch_code: string;
  branch_name: string;
  total_students: number;
  laptop_holders: number;
}

const BranchSchema: Schema = new Schema({
  branch_code: { type: String, required: true, unique: true },
  branch_name: { type: String, required: true },
  total_students: { type: Number, required: true },
  laptop_holders: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
