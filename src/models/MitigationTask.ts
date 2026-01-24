import mongoose, { Schema, Document, Types } from 'mongoose';

export type MitigationType = 'ACADEMIC' | 'PARTICIPATION' | 'TESTING';
export type MitigationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type MitigationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IMitigationTask extends Document {
    branch_code: string;
    type: MitigationType;
    description: string;
    status: MitigationStatus;
    assigned_to?: Types.ObjectId; // User assigned to carry out the task
    created_by: Types.ObjectId; // Admin/Faculty who created it
    priority: MitigationPriority;
    due_date?: Date;
    completed_at?: Date;
    notes?: string;
}

const MitigationTaskSchema: Schema = new Schema({
    branch_code: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['ACADEMIC', 'PARTICIPATION', 'TESTING'],
        required: true
    },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING',
        required: true
    },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
        required: true
    },
    due_date: { type: Date },
    completed_at: { type: Date },
    notes: { type: String }
}, {
    timestamps: true
});

// Avoid re-compiling model in Next.js hot reload
export default mongoose.models.MitigationTask || mongoose.model<IMitigationTask>('MitigationTask', MitigationTaskSchema);
