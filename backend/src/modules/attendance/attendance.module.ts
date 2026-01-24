import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceEntry } from './attendance-entry.entity';
import { AttendanceController } from './attendance.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AttendanceSession, AttendanceEntry])],
    exports: [TypeOrmModule],
    controllers: [AttendanceController],
})
export class AttendanceModule { }
