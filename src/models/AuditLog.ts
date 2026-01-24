import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    user_id?: mongoose.Types.ObjectId;
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, index: true },
    entity_type: { type: String, index: true },
    entity_id: { type: String, index: true },
    details: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Logs are immutable
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
