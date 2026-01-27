import mongoose, { Schema, Document } from 'mongoose';

export interface IGenericRecord extends Document {
  schema_id: string; // ID from INSTITUTIONAL_SCHEMAS
  epoch: number;    // week_number or cycle_number
  data: any[];      // Array of row data
  status: 'DRAFT' | 'LOCKED';
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const GenericRecordSchema = new Schema({
  schema_id: { type: String, required: true, index: true },
  epoch: { type: Number, required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['DRAFT', 'LOCKED'], default: 'DRAFT' },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Unique index to prevent duplicates for the same schema and epoch
GenericRecordSchema.index({ schema_id: 1, epoch: 1 }, { unique: true });

export default mongoose.models.GenericRecord || mongoose.model<IGenericRecord>('GenericRecord', GenericRecordSchema);
