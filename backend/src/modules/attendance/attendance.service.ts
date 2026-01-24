import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceEntry } from './attendance-entry.entity';
import { BulkAttendanceEntriesDto } from './dto/bulk-attendance-entries.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(AttendanceSession)
        private sessionRepository: Repository<AttendanceSession>,
        @InjectRepository(AttendanceEntry)
        private entryRepository: Repository<AttendanceEntry>,
        private auditService: AuditService,
    ) { }

    async createSession(data: Partial<AttendanceSession>) {
        const session = this.sessionRepository.create(data);
        return this.sessionRepository.save(session);
    }

    async findSession(id: number) {
        const session = await this.sessionRepository.findOne({ where: { id } });
        if (!session) throw new NotFoundException('Attendance session not found');
        return session;
    }

    async bulkUpsertEntries(sessionId: number, dto: BulkAttendanceEntriesDto) {
        const session = await this.findSession(sessionId);

        for (const entryDto of dto.entries) {
            let entry = await this.entryRepository.findOne({
                where: { sessionId, studentId: entryDto.studentId },
            });

            const oldStatus = entry ? entry.status : null;

            if (!entry) {
                entry = this.entryRepository.create({
                    sessionId,
                    ...entryDto,
                    editedByUserId: dto.editedBy,
                });
            } else {
                Object.assign(entry, {
                    ...entryDto,
                    editedByUserId: dto.editedBy,
                    lastEditedAt: new Date(),
                });
            }

            await this.entryRepository.save(entry);

            // Audit if status changed
            if (oldStatus !== entryDto.status) {
                await this.auditService.logChange(
                    'attendance_entries',
                    Number(entry.id),
                    'status',
                    oldStatus,
                    entryDto.status,
                    dto.editedBy,
                );
            }
        }

        return { success: true, count: dto.entries.length };
    }
}
