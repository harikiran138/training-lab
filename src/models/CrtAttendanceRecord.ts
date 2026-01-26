import mongoose, { Schema, Document } from 'mongoose';

export interface ICrtAttendanceRecord extends Document {
  branch_id: mongoose.Types.ObjectId;
  
  // Time Dimension
  academic_year: string; // "2025-26"
  week_number: number;
  week_start_date: Date;
  week_end_date: Date;

  // Context
  batch: string; // "3-2"
  semester?: number;

  // Metrics
  total_strength: number;
  attended_count: number;
  attendance_percentage: number;
  
  // Daily Breakdown
  daily_stats: Array<{
    date: Date;
    day_name: string;
    attended: number;
    topic_covered?: string;
  }>;

  // Legacy Input Fields (Optional, for form compatibility if needed, but daily_stats is preferred source of truth)
  day1_attended?: number; day2_attended?: number; day3_attended?: number;
  day4_attended?: number; day5_attended?: number; day6_attended?: number;

  // Analysis
  performance_level: 'High' | 'Medium' | 'Low';
  risk_flag: 'RED' | 'AMBER' | 'GREEN';
  remarks?: string;

  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

const CrtAttendanceRecordSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  
  // Time Dimension (CRITICAL)
  academic_year: { type: String, required: true, index: true },
  week_number: { type: Number, required: true },
  week_start_date: { type: Date, required: true },
  week_end_date: { type: Date, required: true },
  
  // Context
  batch: { type: String, required: true }, // "3-2"
  semester: { type: Number },

  // Metrics
  total_strength: { type: Number, required: true },
  attended_count: { type: Number, required: true }, // Derived summary
  attendance_percentage: { type: Number, required: true }, // Derived summary

  // Daily Data (Structured)
  daily_stats: [{
    date: { type: Date },
    day_name: { type: String }, // "Mon"
    attended: { type: Number, default: 0 },
    topic_covered: { type: String }
  }],

  // Legacy flat fields for backward compatibility with current Form UI (optional, kept for easier mapping)
  day1_attended: { type: Number, default: 0 },
  day2_attended: { type: Number, default: 0 },
  day3_attended: { type: Number, default: 0 },
  day4_attended: { type: Number, default: 0 },
  day5_attended: { type: Number, default: 0 },
  day6_attended: { type: Number, default: 0 },

  // Intelligence
  risk_flag: { type: String, enum: ['RED', 'AMBER', 'GREEN'], default: 'GREEN' },
  performance_level: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  remarks: { type: String },

  is_locked: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

// Composite index for uniqueness
CrtAttendanceRecordSchema.index({ branch_id: 1, academic_year: 1, week_number: 1 }, { unique: true });

export default mongoose.models.CrtAttendanceRecord || mongoose.model<ICrtAttendanceRecord>('CrtAttendanceRecord', CrtAttendanceRecordSchema);
