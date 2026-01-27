import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user_id?: string; // FacultyID, StudentID, or AdminID
  role?: string;    // 'Admin', 'Faculty', 'Student'
  action: string;   // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN'
  table_name?: string; // 'Student', 'Marks', etc. or Entity Type
  record_id?: string;  // ID of the specific record affected
  old_value?: any;     // Snapshot of data before change
  new_value?: any;     // Snapshot of data after change
  details?: string | Record<string, any>; // Human readable description or details object
  ip_address?: string;
  user_agent?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  user_id: { type: String, index: true },
  role: { type: String },
  action: { type: String, required: true, index: true },
  table_name: { type: String, index: true },
  record_id: { type: String, index: true },
  old_value: { type: mongoose.Schema.Types.Mixed },
  new_value: { type: mongoose.Schema.Types.Mixed },
  details: { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  user_agent: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for fast innovative querying/audit reports
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ table_name: 1, record_id: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
