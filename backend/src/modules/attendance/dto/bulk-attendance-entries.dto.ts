import { IsNumber, IsOptional, IsEnum, IsUUID, Min, Max, ValidateIf, IsString } from 'class-validator';
import { DataSourceType } from '../../../common/constants';

class AttendanceEntryDto {
    @IsNumber()
    studentId: number;

    @IsString()
    status: string; // 'PRESENT', 'ABSENT', 'LATE', 'ON_DUTY'

    @IsEnum(DataSourceType)
    source: DataSourceType;

    @ValidateIf((o) => o.source === DataSourceType.IMAGE_AI)
    @IsNumber()
    @Min(0)
    @Max(1)
    confidenceScore: number;
}

export class BulkAttendanceEntriesDto {
    @IsUUID()
    editedBy: string;

    entries: AttendanceEntryDto[];
}
