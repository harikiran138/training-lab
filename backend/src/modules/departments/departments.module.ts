import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { SyllabusProgress } from './syllabus-progress.entity';
import { WeeklyReport } from './weekly-report.entity';
import { DepartmentsService } from './departments.service';
import { SyllabusService } from './syllabus.service';
import { DepartmentsController } from './departments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Department, SyllabusProgress, WeeklyReport])],
    controllers: [DepartmentsController],
    providers: [DepartmentsService, SyllabusService],
    exports: [TypeOrmModule, DepartmentsService, SyllabusService],
})
export class DepartmentsModule { }
