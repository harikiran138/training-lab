import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Assessment } from './assessment.entity';
import { Student } from '../students/student.entity';
import { DataSourceType } from '../../common/constants';

@Entity('assessment_entries')
@Unique(['assessment', 'student'])
export class AssessmentEntry {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Assessment, (assessment) => assessment.entries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assessment_id' })
    assessment: Assessment;

    @Column({ name: 'assessment_id' })
    assessmentId: number;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'obtained_marks' })
    obtainedMarks: number;

    @Column({ name: 'is_absent', default: false })
    isAbsent: boolean;

    @Column({ type: 'enum', enum: DataSourceType, default: DataSourceType.MANUAL })
    source: DataSourceType;

    @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true, name: 'confidence_score' })
    confidenceScore: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'last_edited_at' })
    lastEditedAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'edited_by_user_id' })
    editedByUserId: string;
}
