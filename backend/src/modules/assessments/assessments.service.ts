import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentEntry } from './assessment-entry.entity';
import { BulkAssessmentEntriesDto } from './dto/bulk-assessment-entries.dto';
import { AuditService } from '../audit/audit.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AssessmentsService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(AssessmentEntry)
        private entryRepository: Repository<AssessmentEntry>,
        private auditService: AuditService,
        private dataSource: DataSource,
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

    async getWeeklyAssessments(branchCode: string, sectionName: string, semester: string) {
        return this.assessmentRepository.createQueryBuilder('assessment')
            .leftJoinAndSelect('assessment.section', 'section')
            .where('assessment.branchCode = :branchCode', { branchCode })
            .andWhere('assessment.semester = :semester', { semester })
            .andWhere('section.name = :sectionName', { sectionName })
            .orderBy('assessment.weekNo', 'ASC')
            .getMany();
    }

    async createWeeklyAssessment(branchCode: string, sectionName: string, semester: string) {
        // Find section ID
        const sectionResult = await this.dataSource.query(
            'SELECT s.id FROM sections s JOIN departments d ON s.department_id = d.id WHERE d.code = $1 AND s.name = $2',
            [branchCode, sectionName]
        );
        if (!sectionResult || sectionResult.length === 0) {
            throw new NotFoundException(`Section ${sectionName} for branch ${branchCode} not found`);
        }
        const sectionId = sectionResult[0].id;

        const latest = await this.assessmentRepository.createQueryBuilder('assessment')
            .where('assessment.branchCode = :branchCode', { branchCode })
            .andWhere('assessment.semester = :semester', { semester })
            .andWhere('assessment.sectionId = :sectionId', { sectionId })
            .orderBy('assessment.weekNo', 'DESC')
            .getOne();

        const nextWeek = latest ? latest.weekNo + 1 : 1;

        const assessment = this.assessmentRepository.create({
            branchCode,
            semester,
            sectionId,
            title: `Week ${nextWeek} Assessment`, // default title
            weekNo: nextWeek,
            status: 'draft',
            sessions: 0,
            avgAttendancePercent: 0,
            avgTestAttendancePercent: 0,
            avgTestPassPercent: 0,
            totalMarks: 100 // placeholder
        });

        return this.assessmentRepository.save(assessment);
    }

    async updateWeeklyAssessment(id: number, updates: any) {
        const assessment = await this.findOne(id);

        if (assessment.status === 'finalized' && !updates.status) {
            throw new Error('Finalized reports cannot be edited');
        }

        // Map frontend structure if needed
        let updateData: any = { ...updates };

        // Handle nested mongoose paths that the frontend might send
        if (updates['attendance.avg_attendance_percent'] !== undefined) {
            updateData.avgAttendancePercent = updates['attendance.avg_attendance_percent'];
            delete updateData['attendance.avg_attendance_percent'];
        }
        if (updates['tests.avg_test_attendance_percent'] !== undefined) {
            updateData.avgTestAttendancePercent = updates['tests.avg_test_attendance_percent'];
            delete updateData['tests.avg_test_attendance_percent'];
        }
        if (updates['tests.avg_test_pass_percent'] !== undefined) {
            updateData.avgTestPassPercent = updates['tests.avg_test_pass_percent'];
            delete updateData['tests.avg_test_pass_percent'];
        }

        // Safety against unmapped properties
        delete updateData._id;

        Object.assign(assessment, updateData);
        return this.assessmentRepository.save(assessment);
    }
}
