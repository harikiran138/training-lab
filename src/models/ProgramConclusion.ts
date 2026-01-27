import mongoose, { Schema, Document } from 'mongoose';

export interface IProgramConclusion extends Document {
  academic_year: string;
  week_number: number;
  
  author_role: 'Principal' | 'TPO' | 'Director';
  author_name: string;
  
  executive_summary: string; // The "Conclusion" text
  
  key_achievements: string[];
  areas_of_concern: string[];
  action_plan_next_week: string[];
  
  overall_rating: number; // 1-10 health score
  is_published: boolean;
}

const ProgramConclusionSchema = new Schema({
  academic_year: { type: String, required: true },
  week_number: { type: Number, required: true, unique: true }, // One master conclusion per week

  author_role: { 
    type: String, 
    enum: ['Principal', 'TPO', 'Director'], 
    required: true 
  },
  author_name: { type: String, required: true },

  executive_summary: { type: String, required: true },
  
  key_achievements: [{ type: String }],
  areas_of_concern: [{ type: String }],
  action_plan_next_week: [{ type: String }],

  overall_rating: { type: Number, min: 1, max: 10, required: true },
  is_published: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.ProgramConclusion || mongoose.model<IProgramConclusion>('ProgramConclusion', ProgramConclusionSchema);
