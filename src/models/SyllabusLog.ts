import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabusLog extends Document {
  branch_id: mongoose.Types.ObjectId;
  academic_year: string;
  week_number: number;
  
  subject_name: string;
  module_name: string;
  
  topics_covered: string[];
  completion_percent: number; // Cumulative
  
  status: 'On-Track' | 'Lagging' | 'Ahead';
  faculty_remarks: string;
}

const SyllabusLogSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true },

  subject_name: { type: String, required: true }, // e.g., "Java Full Stack"
  module_name: { type: String, required: true }, // e.g., "Collections Framework"

  topics_covered: [{ type: String }],
  completion_percent: { type: Number, required: true, min: 0, max: 100 },

  status: { 
    type: String, 
    enum: ['On-Track', 'Lagging', 'Ahead'],
    default: 'On-Track' 
  },
  faculty_remarks: { type: String }
}, { timestamps: true });

// One log per subject per branch per week
SyllabusLogSchema.index({ branch_id: 1, week_number: 1, subject_name: 1 }, { unique: true });

export default mongoose.models.SyllabusLog || mongoose.model<ISyllabusLog>('SyllabusLog', SyllabusLogSchema);
