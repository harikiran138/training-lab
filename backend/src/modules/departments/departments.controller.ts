import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('departments')
@UseInterceptors(AuditInterceptor)
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Post('weekly-reports')
    async bulkUpsert(@Body() reports: any[]) {
        return this.departmentsService.bulkUpsertWeeklyReport(reports);
    }
}
