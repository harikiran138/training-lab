import mongoose, { Schema, Document } from 'mongoose';

export interface ICrtAttendanceRecord extends Document {
  branch_code: string;
  total_strength: number;
  
  // Day-wise Attendance Input
  day1_attended: number | "No CRT";
  day1_percent: number | "No CRT";
  day2_attended: number | "No CRT";
  day2_percent: number | "No CRT";
  day3_attended: number | "No CRT";
  day3_percent: number | "No CRT";
  day4_attended: number | "No CRT";
  day4_percent: number | "No CRT";
  day5_attended: number | "No CRT";
  day5_percent: number | "No CRT";
  day6_attended: number | "No CRT";
  day6_percent: number | "No CRT";

  // Summary & Intelligence (Automated)
  weekly_average_percent: number;
  no_crt_days: number;
  trend: string; // ↑ Improving / ↓ Dropping / –
  performance_level: 'High' | 'Medium' | 'Low';
  risk_flag: '⚠ Critical' | 'OK';
  remarks: string;

  week_number: number;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const CrtAttendanceRecordSchema: Schema = new Schema({
  branch_code: { type: String, required: true, index: true },
  total_strength: { type: Number, required: true },
  
  // Day-wise Data
  day1_attended: { type: Schema.Types.Mixed, default: 0 },
  day1_percent: { type: Schema.Types.Mixed, default: 0 },
  day2_attended: { type: Schema.Types.Mixed, default: 0 },
  day2_percent: { type: Schema.Types.Mixed, default: 0 },
  day3_attended: { type: Schema.Types.Mixed, default: 0 },
  day3_percent: { type: Schema.Types.Mixed, default: 0 },
  day4_attended: { type: Schema.Types.Mixed, default: 0 },
  day4_percent: { type: Schema.Types.Mixed, default: 0 },
  day5_attended: { type: Schema.Types.Mixed, default: 0 },
  day5_percent: { type: Schema.Types.Mixed, default: 0 },
  day6_attended: { type: Schema.Types.Mixed, default: 0 },
  day6_percent: { type: Schema.Types.Mixed, default: 0 },

  // Summary intelligence
  weekly_average_percent: { type: Number, default: 0 },
  no_crt_days: { type: Number, default: 0 },
  trend: { type: String, default: "–" },
  performance_level: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  risk_flag: { 
    type: String, 
    enum: ['⚠ Critical', 'OK'],
    default: 'OK'
  },
  remarks: { type: String, default: "" },

  week_number: { type: Number, required: true, index: true },
  start_date: { type: Date },
  end_date: { type: Date }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  autoIndex: true
});

// Composite index for unique reports per branch and week
CrtAttendanceRecordSchema.index({ branch_code: 1, week_number: 1 }, { unique: true });

export default mongoose.models.CrtAttendanceRecord || mongoose.model<ICrtAttendanceRecord>('CrtAttendanceRecord', CrtAttendanceRecordSchema);
