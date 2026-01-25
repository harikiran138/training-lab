import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

interface AuditLogParams {
  userId: string;
  role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'SYSTEM';
  tableName: string;
  recordId?: string;
  oldValue?: any;
  newValue?: any;
  details?: string;
  ipAddress?: string;
}

export async function logAudit(params: AuditLogParams) {
  try {
    await dbConnect();
    
    const log = new AuditLog({
      user_id: params.userId,
      role: params.role,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      old_value: params.oldValue,
      new_value: params.newValue,
      details: params.details,
      ip_address: params.ipAddress
    });

    await log.save();
    console.log(`[AUDIT] Action: ${params.action} on ${params.tableName} by ${params.userId}`);
  } catch (error) {
    console.error("[AUDIT FAILED] Could not create audit log:", error);
    // Silent fail to not block main thread, but log error
  }
}
