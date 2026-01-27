import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentFeedbackWeekly extends Document {
  branch_id: mongoose.Types.ObjectId;
  academic_year: string;
  week_number: number;
  
  session_type: 'CRT' | 'Technical' | 'Soft Skills';
  faculty_id?: mongoose.Types.ObjectId; // Optional link
  
  avg_rating_faculty: number; // 1-5
  avg_rating_content: number; // 1-5
  avg_rating_lab: number; // 1-5
  
  sentiment_summary: string; // NLP summarized text
  key_issues: string[];
  
  response_count: number;
}

const StudentFeedbackWeeklySchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true },

  session_type: { 
    type: String, 
    enum: ['CRT', 'Technical', 'Soft Skills'],
    required: true 
  },
  faculty_id: { type: Schema.Types.ObjectId, ref: 'Faculty' },

  avg_rating_faculty: { type: Number, min: 1, max: 5 },
  avg_rating_content: { type: Number, min: 1, max: 5 },
  avg_rating_lab: { type: Number, min: 1, max: 5 },

  sentiment_summary: { type: String },
  key_issues: [{ type: String }],

  response_count: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.StudentFeedbackWeekly || mongoose.model<IStudentFeedbackWeekly>('StudentFeedbackWeekly', StudentFeedbackWeeklySchema);
