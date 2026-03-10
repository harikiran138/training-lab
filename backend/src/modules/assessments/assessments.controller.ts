import { Controller, Post, Get, Put, Body, Param, Query, ParseIntPipe, UseInterceptors } from '@nestjs/common';
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

    @Get('weekly/data')
    getWeeklyAssessments(
        @Query('branch') branchCode: string,
        @Query('section') sectionName: string,
        @Query('semester') semester: string,
    ) {
        return this.assessmentsService.getWeeklyAssessments(branchCode, sectionName, semester);
    }

    @Post('weekly/data')
    createWeeklyAssessment(
        @Body('branch') branchCode: string,
        @Body('section') sectionName: string,
        @Body('semester') semester: string,
    ) {
        return this.assessmentsService.createWeeklyAssessment(branchCode, sectionName, semester);
    }

    @Put('weekly/data/:id')
    updateWeeklyAssessment(
        @Param('id', ParseIntPipe) id: number,
        @Body('updates') updates: any,
    ) {
        return this.assessmentsService.updateWeeklyAssessment(id, updates);
    }
}
