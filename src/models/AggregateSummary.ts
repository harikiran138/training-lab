import mongoose, { Schema, Document } from 'mongoose';

export interface IAggregateSummary extends Document {
  branch_code: string;
  total_weeks: number;
  avg_attendance: number;
  avg_test_attendance: number;
  avg_test_pass: number;
  syllabus_completion_percent: number;
  performance_grade: string;
  ai_risk_level?: 'Low' | 'Medium' | 'High';
  ai_recommendation?: string;
}

const AggregateSummarySchema: Schema = new Schema({
  branch_code: { type: String, required: true, unique: true },
  total_weeks: { type: Number, required: true, default: 0 },
  avg_attendance: { type: Number, required: true, default: 0 },
  avg_test_attendance: { type: Number, required: true, default: 0 },
  avg_test_pass: { type: Number, required: true, default: 0 },
  syllabus_completion_percent: { type: Number, required: true, default: 0 },
  performance_grade: { type: String, default: 'N/A' },
  ai_risk_level: { type: String, enum: ['Low', 'Medium', 'High'] },
  ai_recommendation: { type: String }
}, { timestamps: true });

export default mongoose.models.AggregateSummary || mongoose.model<IAggregateSummary>('AggregateSummary', AggregateSummarySchema);
