import mongoose, { Schema, Document } from 'mongoose';

export interface ISwotAnalysis extends Document {
  category: string; // "Strengths", "Weaknesses", "Opportunities", "Threats"
  points: string[];
  academic_year: string;
  created_at: Date;
}

const SwotAnalysisSchema = new Schema({
  category: { 
    type: String, 
    required: true, 
    enum: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'] 
  },
  points: [{ type: String, required: true }],
  academic_year: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.SwotAnalysis || mongoose.model<ISwotAnalysis>('SwotAnalysis', SwotAnalysisSchema);
