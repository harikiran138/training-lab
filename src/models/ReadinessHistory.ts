import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessHistory extends Document {
  student_id: mongoose.Types.ObjectId;
  date_computed: Date;
  score: number;
  contributing_factors: Record<string, number>;
}

const ReadinessHistorySchema = new Schema({
  student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  date_computed: { type: Date, default: Date.now, required: true },
  score: { type: Number, required: true },
  contributing_factors: { type: Map, of: Number } // e.g., { "coding": 80, "aptitude": 60 }
}, {
  timestamps: true
});

// Index for quick retrieval of history for a student
ReadinessHistorySchema.index({ student_id: 1, date_computed: -1 });

export default mongoose.models.ReadinessHistory || mongoose.model<IReadinessHistory>('ReadinessHistory', ReadinessHistorySchema);
