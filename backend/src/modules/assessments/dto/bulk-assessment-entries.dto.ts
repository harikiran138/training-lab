import { IsNumber, IsOptional, IsEnum, IsBoolean, IsUUID, Min, Max, ValidateIf } from 'class-validator';
import { DataSourceType } from '../../../common/constants';

class AssessmentEntryDto {
    @IsNumber()
    studentId: number;

    @IsNumber()
    @IsOptional()
    obtainedMarks: number;

    @IsBoolean()
    @IsOptional()
    isAbsent: boolean;

    @IsEnum(DataSourceType)
    source: DataSourceType;

    @ValidateIf((o) => o.source === DataSourceType.IMAGE_AI)
    @IsNumber()
    @Min(0)
    @Max(1)
    confidenceScore: number;
}

export class BulkAssessmentEntriesDto {
    @IsUUID()
    editedBy: string;

    entries: AssessmentEntryDto[];
}
