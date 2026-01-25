import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  log_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true }, // FacultyID, StudentID, or AdminID
  role: { type: String, required: true }, // 'Admin', 'Faculty', 'Student'
  action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN'
  table_name: { type: String, required: true }, // 'Student', 'Marks', etc.
  record_id: { type: String }, // ID of the specific record affected
  old_value: { type: mongoose.Schema.Types.Mixed }, // Snapshot of data before change
  new_value: { type: mongoose.Schema.Types.Mixed }, // Snapshot of data after change
  ip_address: { type: String },
  details: { type: String }, // Human readable description
}, {
  timestamps: true
});

// Index for fast innovative querying/audit reports
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ table_name: 1, record_id: 1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
