import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentAsset extends Document {
  student_id: mongoose.Types.ObjectId;
  academic_year: string;
  
  device_type: 'Laptop' | 'Tablet' | 'Kit';
  device_serial: string;
  
  status: 'Allocated' | 'In-Repair' | 'Returned' | 'Lost';
  allocated_date: Date;
  return_due_date?: Date;
  
  condition_remarks: string;
  last_audit_week: number;
}

const StudentAssetSchema = new Schema({
  student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  academic_year: { type: String, required: true },

  device_type: { type: String, enum: ['Laptop', 'Tablet', 'Kit'], required: true },
  device_serial: { type: String, required: true, unique: true },

  status: { 
    type: String, 
    enum: ['Allocated', 'In-Repair', 'Returned', 'Lost'],
    default: 'Allocated' 
  },
  allocated_date: { type: Date, default: Date.now },
  return_due_date: { type: Date },

  condition_remarks: { type: String, default: 'Good' },
  last_audit_week: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.StudentAsset || mongoose.model<IStudentAsset>('StudentAsset', StudentAssetSchema);
