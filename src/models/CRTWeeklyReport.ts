import mongoose, { Schema, Document } from 'mongoose';

export interface ICRTWeeklyReport extends Document {
  branch_code: string;
  section: string;
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
  status: 'draft' | 'finalized';
  semester: string;
  locked_at?: Date;
  finalized_by?: mongoose.Types.ObjectId;
}

const CRTWeeklyReportSchema: Schema = new Schema({
  branch_code: { type: String, required: true },
  week_no: { type: Number, required: true },
  sessions: { type: Number, required: true, default: 0 },
  section: { type: String, required: true, default: 'A', index: true },
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
  },
  status: {
    type: String,
    enum: ['draft', 'finalized'],
    default: 'draft',
    index: true
  },
  semester: { type: String, required: true, default: 'SEM1', index: true }, // Defaulting to SEM1 for migration safety
  locked_at: { type: Date },
  finalized_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  // Add index for fast querying by branch and week
  autoIndex: true
});

// Composite index for unique reports per branch, week, semester, and section
CRTWeeklyReportSchema.index({ branch_code: 1, week_no: 1, semester: 1, section: 1 }, { unique: true });

export default mongoose.models.CRTWeeklyReport || mongoose.model<ICRTWeeklyReport>('CRTWeeklyReport', CRTWeeklyReportSchema);
