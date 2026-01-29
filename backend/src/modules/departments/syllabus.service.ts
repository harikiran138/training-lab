import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyllabusProgress } from './syllabus-progress.entity';

@Injectable()
export class SyllabusService {
    constructor(
        @InjectRepository(SyllabusProgress)
        private syllabusRepository: Repository<SyllabusProgress>,
    ) { }

    async calculateOverallCompletion(): Promise<number> {
        const result = await this.syllabusRepository
            .createQueryBuilder('sp')
            .select('AVG(sp.unitsCovered * 100.0 / NULLIF(sp.totalUnits, 0))', 'completion')
            .getRawOne();

        return parseFloat(result?.completion || '0');
    }

    async getSectionProgress(sectionId: number): Promise<number> {
        const result = await this.syllabusRepository
            .createQueryBuilder('sp')
            .select('MAX(sp.unitsCovered * 100.0 / NULLIF(sp.totalUnits, 0))', 'completion')
            .where('sp.sectionId = :sectionId', { sectionId })
            .getRawOne();

        return parseFloat(result?.completion || '0');
    }
}
