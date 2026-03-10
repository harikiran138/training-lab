import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Section } from '../sections/section.entity';
import { AssessmentEntry } from './assessment-entry.entity';

@Entity('assessments')
export class Assessment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'section_id' })
    sectionId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_marks' })
    totalMarks: number;

    @Column({ type: 'timestamp', nullable: true, name: 'scheduled_at' })
    scheduledAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'created_by_user_id' })
    createdByUserId: string;

    @Column({ name: 'week_no', default: 1 })
    weekNo: number;

    @Column({ default: 0 })
    sessions: number;

    @Column({ default: 'draft' })
    status: string;

    @Column({ nullable: true })
    semester: string;

    @Column({ name: 'branch_code', nullable: true })
    branchCode: string;

    @Column({ name: 'avg_attendance_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
    avgAttendancePercent: number;

    @Column({ name: 'avg_test_attendance_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
    avgTestAttendancePercent: number;

    @Column({ name: 'avg_test_pass_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
    avgTestPassPercent: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => AssessmentEntry, (entry) => entry.assessment)
    entries: AssessmentEntry[];
}
