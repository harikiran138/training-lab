import { Controller, Post, Get, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { BulkAssessmentEntriesDto } from './dto/bulk-assessment-entries.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('assessments')
@UseInterceptors(AuditInterceptor)
export class AssessmentsController {
    constructor(private readonly assessmentsService: AssessmentsService) { }

    @Post()
    create(@Body() data: any) {
        return this.assessmentsService.createAssessment(data);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.assessmentsService.findOne(id);
    }

    @Post(':id/entries')
    bulkUpsert(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: BulkAssessmentEntriesDto,
    ) {
        return this.assessmentsService.bulkUpsertEntries(id, dto);
    }
}
