import mongoose, { Schema, Document } from 'mongoose';

export interface ICRTWeeklyReport extends Document {
  branch_code: string;
  week_no: number;
  sessions: number;
  attendance: {
    avg_attendance_percent: number;
  };
  tests: {
    avg_test_attendance_percent: number;
    avg_test_pass_percent: number;
  };
  syllabus: {
    covered: number;
    total: number;
  };
  computed: {
    attendance_score: number;
    test_score: number;
    overall_score: number;
  };
}

const CRTWeeklyReportSchema: Schema = new Schema({
  branch_code: { type: String, required: true },
  week_no: { type: Number, required: true },
  sessions: { type: Number, required: true, default: 0 },
  attendance: {
    avg_attendance_percent: { type: Number, required: true, default: 0 }
  },
  tests: {
    avg_test_attendance_percent: { type: Number, required: true, default: 0 },
    avg_test_pass_percent: { type: Number, required: true, default: 0 }
  },
  syllabus: {
    covered: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 }
  },
  computed: {
    attendance_score: { type: Number, default: 0 },
    test_score: { type: Number, default: 0 },
    overall_score: { type: Number, default: 0 }
  }
}, { 
  timestamps: true,
  // Add index for fast querying by branch and week
  autoIndex: true
});

// Composite index for unique reports per branch and week
CRTWeeklyReportSchema.index({ branch_code: 1, week_no: 1 }, { unique: true });

export default mongoose.models.CRTWeeklyReport || mongoose.model<ICRTWeeklyReport>('CRTWeeklyReport', CRTWeeklyReportSchema);
