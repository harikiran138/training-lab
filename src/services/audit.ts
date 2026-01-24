import AuditLog from '@/models/AuditLog';
import { Types } from 'mongoose';

export async function logAction(
    userId: string | Types.ObjectId | undefined,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>
) {
    try {
        await AuditLog.create({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Non-blocking error - we don't want to crash the request if logging fails
    }
}
