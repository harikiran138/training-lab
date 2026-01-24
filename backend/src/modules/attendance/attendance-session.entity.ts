import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Section } from '../sections/section.entity';
import { AttendanceEntry } from './attendance-entry.entity';

@Entity('attendance_sessions')
@Unique(['section', 'date'])
export class AttendanceSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'section_id' })
    sectionId: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'week_number', nullable: true })
    weekNumber: number;

    @Column({ type: 'uuid', nullable: true, name: 'created_by_user_id' })
    createdByUserId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => AttendanceEntry, (entry) => entry.session)
    entries: AttendanceEntry[];
}
