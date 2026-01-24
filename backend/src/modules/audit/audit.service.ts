import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) { }

    async logChange(
        tableName: string,
        recordId: number,
        fieldChanged: string,
        oldValue: any,
        newValue: any,
        userId: string,
    ) {
        const log = this.auditLogRepository.create({
            tableName,
            recordId,
            fieldChanged,
            oldValue: String(oldValue),
            newValue: String(newValue),
            changedByUserId: userId,
        });
        return this.auditLogRepository.save(log);
    }
}
