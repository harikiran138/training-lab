import mongoose, { Schema, Document } from 'mongoose';

export interface ICRTWeeklyReport extends Document {
  branch_code: string;
  week_no: number;
  week_start_date?: Date;
  week_end_date?: Date;
  sessions: number;
  total_training_hours?: number;
  
  attendance: {
    avg_attendance_percent: number;
    low_attendance_count?: number; // Count of students with < X% attendance
  };
  
  tests: {
    avg_test_attendance_percent: number;
    avg_test_pass_percent: number;
    test_name?: string;
  };
  
  syllabus: {
    covered: number;
    total: number;
    coverage_percent: number;
    status: 'Lagging' | 'On-Track' | 'Ahead';
  };
  
  // New: Section granular data
  section_data?: Array<{
    section_name: string; // e.g., "A", "B", "C"
    strength: number;
    avg_attendance: number;
    avg_pass_percent: number;
  }>;

  computed: {
    attendance_score: number;
    test_score: number;
    overall_score: number;
    risk_level: 'Healthy' | 'Needs Attention' | 'Critical';
    risk_reason?: string;
  };
}

const CRTWeeklyReportSchema: Schema = new Schema({
  branch_code: { type: String, required: true, index: true },
  week_no: { type: Number, required: true, index: true },
  week_start_date: { type: Date },
  week_end_date: { type: Date },
  sessions: { type: Number, required: true, default: 0 },
  total_training_hours: { type: Number, default: 0 },

  attendance: {
    avg_attendance_percent: { type: Number, required: true, default: 0 },
    low_attendance_count: { type: Number, default: 0 }
  },
  
  tests: {
    avg_test_attendance_percent: { type: Number, required: true, default: 0 },
    avg_test_pass_percent: { type: Number, required: true, default: 0 },
    test_name: { type: String }
  },
  
  syllabus: {
    covered: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    coverage_percent: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['Lagging', 'On-Track', 'Ahead'],
      default: 'On-Track' 
    }
  },

  section_data: [{
    section_name: String,
    strength: Number,
    avg_attendance: Number,
    avg_pass_percent: Number
  }],

  computed: {
    attendance_score: { type: Number, default: 0 },
    test_score: { type: Number, default: 0 },
    overall_score: { type: Number, default: 0 },
    risk_level: { 
      type: String, 
      enum: ['Healthy', 'Needs Attention', 'Critical'],
      default: 'Healthy' 
    },
    risk_reason: { type: String }
  }
}, { 
  timestamps: true,
  autoIndex: true
});

// Composite index for unique reports per branch and week
CRTWeeklyReportSchema.index({ branch_code: 1, week_no: 1 }, { unique: true });

export default mongoose.models.CRTWeeklyReport || mongoose.model<ICRTWeeklyReport>('CRTWeeklyReport', CRTWeeklyReportSchema);
