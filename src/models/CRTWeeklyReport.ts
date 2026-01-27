import mongoose, { Schema, Document } from 'mongoose';

export interface ICRTWeeklyReport extends Document {
  branch_code: string;
  section: string;
  week_no: number;
  week_start_date?: Date;
  week_end_date?: Date;
  sessions: number;
  total_training_hours?: number;

  attendance: {
    avg_attendance_percent: number;
    low_attendance_count?: number; // Count of students with < X% attendance
    daily?: Array<{
      day_no: number;
      attendance_count: number | "No CRT";
      attendance_percent?: number;
      is_no_crt: boolean;
    }>;
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

  // Growth Metrics
  personality_development?: {
    avg_score: number;
    sessions_conducted: number;
  };
  motivation?: {
    avg_score: number;
  };
  reading_time?: {
    total_minutes: number;
    avg_minutes_per_student: number;
  };

  laptop_holders?: {
    count: number;
    percent: number;
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
  status: 'draft' | 'finalized';
  semester: string;
  locked_at?: Date;
  finalized_by?: mongoose.Types.ObjectId;
}

const CRTWeeklyReportSchema: Schema = new Schema({
  branch_code: { type: String, required: true, index: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', index: true }, // V2 Link
  week_no: { type: Number, required: true, index: true },
  week_start_date: { type: Date },
  week_end_date: { type: Date },
  sessions: { type: Number, required: true, default: 0 },
  total_training_hours: { type: Number, default: 0 },
  section: { type: String, required: true, default: 'A', index: true },
  attendance: {
    avg_attendance_percent: { type: Number, required: true, default: 0 },
    low_attendance_count: { type: Number, default: 0 },
    daily: [{
      day_no: Number,
      attendance_count: Schema.Types.Mixed, // number or "No CRT"
      attendance_percent: Number,
      is_no_crt: Boolean
    }]
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

  personality_development: {
    avg_score: { type: Number, default: 0 },
    sessions_conducted: { type: Number, default: 0 }
  },

  motivation: {
    avg_score: { type: Number, default: 0 }
  },

  reading_time: {
    total_minutes: { type: Number, default: 0 },
    avg_minutes_per_student: { type: Number, default: 0 }
  },

  laptop_holders: {
    count: { type: Number, default: 0 },
    percent: { type: Number, default: 0 }
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
  },
  status: {
    type: String,
    enum: ['draft', 'finalized'],
    default: 'draft',
    index: true
  },
  semester: { type: String, required: true, default: 'SEM1', index: true },
  locked_at: { type: Date },
  finalized_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  autoIndex: true
});

// Composite index for unique reports per branch, week, semester, and section
CRTWeeklyReportSchema.index({ branch_code: 1, week_no: 1, semester: 1, section: 1 }, { unique: true });

export default mongoose.models.CRTWeeklyReport || mongoose.model<ICRTWeeklyReport>('CRTWeeklyReport', CRTWeeklyReportSchema);
