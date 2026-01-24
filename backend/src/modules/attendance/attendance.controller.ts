import { Controller, Post, Get, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceEntriesDto } from './dto/bulk-attendance-entries.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('attendance')
@UseInterceptors(AuditInterceptor)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('sessions')
    create(@Body() data: any) {
        return this.attendanceService.createSession(data);
    }

    @Get('sessions/:id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.findSession(id);
    }

    @Post('sessions/:id/entries')
    bulkUpsert(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: BulkAttendanceEntriesDto,
    ) {
        return this.attendanceService.bulkUpsertEntries(id, dto);
    }
}
