import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentWeekly extends Document {
  branch_id: mongoose.Types.ObjectId;
  academic_year: string;
  week_number: number;
  
  exam_type: 'Aptitude' | 'Coding' | 'Verbal' | 'Mock Interview';
  exam_date: Date;
  
  total_students: number;
  appeared_count: number;
  passed_count: number;
  avg_score: number;
  highest_score: number;
  
  performance_band: 'Excellent' | 'Good' | 'Average' | 'Poor';
  created_at: Date;
}

const AssessmentWeeklySchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true },

  exam_type: { 
    type: String, 
    enum: ['Aptitude', 'Coding', 'Verbal', 'Mock Interview'], 
    required: true 
  },
  exam_date: { type: Date, required: true },

  total_students: { type: Number, required: true },
  appeared_count: { type: Number, required: true },
  passed_count: { type: Number, required: true },
  avg_score: { type: Number, required: true },
  highest_score: { type: Number, default: 0 },

  performance_band: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Average', 'Poor'],
    default: 'Average'
  }
}, { timestamps: true });

// Ensure one record per exam type per branch per week
AssessmentWeeklySchema.index({ branch_id: 1, week_number: 1, exam_type: 1 }, { unique: true });

export default mongoose.models.AssessmentWeekly || mongoose.model<IAssessmentWeekly>('AssessmentWeekly', AssessmentWeeklySchema);
