import mongoose, { Schema, Document } from 'mongoose';

export interface IIngestionLog extends Document {
  batch_id?: string; // Optional link to a specific upload batch
  filename: string;
  upload_date: Date;
  processed_rows: number;
  success_count: number;
  error_count: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS';
  anomalies: Array<{
    row_index?: number;
    field?: string;
    issue: string;
    value?: any;
    severity: 'WARNING' | 'CRITICAL';
  }>;
}

const IngestionLogSchema: Schema = new Schema({
  batch_id: { type: String },
  filename: { type: String, required: true },
  upload_date: { type: Date, default: Date.now },
  processed_rows: { type: Number, default: 0 },
  success_count: { type: Number, default: 0 },
  error_count: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL_SUCCESS'],
    default: 'PROCESSING'
  },
  anomalies: [{
    row_index: Number,
    field: String,
    issue: String,
    value: Schema.Types.Mixed,
    severity: { type: String, enum: ['WARNING', 'CRITICAL'] }
  }]
}, { timestamps: true });

export default mongoose.models.IngestionLog || mongoose.model<IIngestionLog>('IngestionLog', IngestionLogSchema);
