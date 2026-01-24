import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentEntry } from './assessment-entry.entity';
import { AssessmentsController } from './assessments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Assessment, AssessmentEntry])],
    exports: [TypeOrmModule],
    controllers: [AssessmentsController],
})
export class AssessmentsModule { }
