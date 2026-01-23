import mongoose, { Schema, Document } from 'mongoose';

export interface IWeek extends Document {
  week_no: number;
  start_date: Date;
  end_date: Date;
  label: string;
}

const WeekSchema: Schema = new Schema({
  week_no: { type: Number, required: true, unique: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  label: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Week || mongoose.model<IWeek>('Week', WeekSchema);
