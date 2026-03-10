import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentEntry } from './assessment-entry.entity';
import { AssessmentsController } from './assessments.controller';

import { AssessmentsService } from './assessments.service';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Assessment, AssessmentEntry]),
        AuditModule,
    ],
    providers: [AssessmentsService],
    exports: [TypeOrmModule, AssessmentsService],
    controllers: [AssessmentsController],
})
export class AssessmentsModule { }
