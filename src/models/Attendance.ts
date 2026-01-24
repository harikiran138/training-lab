import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    studentId: string;
    name?: string;
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    score?: number; // Optional, for test results if mixed
    sourceStagingId: mongoose.Types.ObjectId;
}

const AttendanceSchema: Schema = new Schema({
    studentId: { type: String, required: true, index: true },
    name: { type: String },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE'],
        default: 'PRESENT'
    },
    score: { type: Number },
    sourceStagingId: { type: Schema.Types.ObjectId, ref: 'StagingData' }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
