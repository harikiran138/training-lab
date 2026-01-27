import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentCareerLog extends Document {
  student_id: mongoose.Types.ObjectId;
  academic_year: string;
  week_number: number; // Snapshot week
  
  primary_goal: 'Product' | 'Service' | 'Startup' | 'Higher Ed' | 'Govt';
  target_companies: string[];
  
  skill_gap_analysis: string; // "Needs DSA improvement"
  mentor_remarks: string;
  
  created_at: Date;
}

const StudentCareerLogSchema = new Schema({
  student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true },

  primary_goal: { 
    type: String, 
    enum: ['Product', 'Service', 'Startup', 'Higher Ed', 'Govt'],
    required: true 
  },
  target_companies: [{ type: String }],

  skill_gap_analysis: { type: String },
  mentor_remarks: { type: String }
}, { timestamps: true });

// One snapshot per student per week
StudentCareerLogSchema.index({ student_id: 1, week_number: 1 }, { unique: true });

export default mongoose.models.StudentCareerLog || mongoose.model<IStudentCareerLog>('StudentCareerLog', StudentCareerLogSchema);
