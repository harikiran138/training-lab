import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Section } from '../sections/section.entity';

@Entity('syllabus_progress')
@Unique(['sectionId', 'weekNo'])
export class SyllabusProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Section, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'section_id' })
    sectionId: number;

    @Column({ name: 'week_no' })
    weekNo: number;

    @Column({ name: 'units_covered', type: 'float', default: 0 })
    unitsCovered: number;

    @Column({ name: 'total_units', type: 'float', default: 0 })
    totalUnits: number;

    @Column({ name: 'last_updated_by', nullable: true })
    lastUpdatedBy: string;

    @CreateDateColumn({ name: 'last_updated_at' })
    lastUpdatedAt: Date;
}
