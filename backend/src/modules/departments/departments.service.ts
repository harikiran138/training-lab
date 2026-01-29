import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { WeeklyReport } from './weekly-report.entity';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(Department)
        private departmentRepository: Repository<Department>,
        @InjectRepository(WeeklyReport)
        private weeklyReportRepository: Repository<WeeklyReport>,
    ) { }

    async bulkUpsertWeeklyReport(reports: any[]) {
        for (const data of reports) {
            await this.weeklyReportRepository.upsert(data, ['departmentCode', 'weekNo']);
        }
        return { count: reports.length };
    }
}
