import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentEntry } from './assessment-entry.entity';
import { BulkAssessmentEntriesDto } from './dto/bulk-assessment-entries.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AssessmentsService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(AssessmentEntry)
        private entryRepository: Repository<AssessmentEntry>,
        private auditService: AuditService,
    ) { }

    async createAssessment(data: Partial<Assessment>) {
        const assessment = this.assessmentRepository.create(data);
        return this.assessmentRepository.save(assessment);
    }

    async findOne(id: number) {
        const assessment = await this.assessmentRepository.findOne({ where: { id } });
        if (!assessment) throw new NotFoundException('Assessment not found');
        return assessment;
    }

    async bulkUpsertEntries(assessmentId: number, dto: BulkAssessmentEntriesDto) {
        const assessment = await this.findOne(assessmentId);

        for (const entryDto of dto.entries) {
            let entry = await this.entryRepository.findOne({
                where: { assessmentId, studentId: entryDto.studentId },
            });

            const oldMarks = entry ? entry.obtainedMarks : null;

            if (!entry) {
                entry = this.entryRepository.create({
                    assessmentId,
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

            // Simple audit if value changed
            if (oldMarks !== entryDto.obtainedMarks) {
                await this.auditService.logChange(
                    'assessment_entries',
                    Number(entry.id),
                    'obtained_marks',
                    oldMarks,
                    entryDto.obtainedMarks,
                    dto.editedBy,
                );
            }
        }

        return { success: true, count: dto.entries.length };
    }
}
