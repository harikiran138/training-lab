import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { Student } from '../students/student.entity';
import { DataSourceType } from '../../common/constants';

@Entity('attendance_entries')
@Unique(['session', 'student'])
export class AttendanceEntry {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => AttendanceSession, (session) => session.entries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session: AttendanceSession;

    @Column({ name: 'session_id' })
    sessionId: number;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: number;

    @Column()
    status: string; // 'PRESENT', 'ABSENT', 'LATE', 'ON_DUTY'

    @Column({ type: 'enum', enum: DataSourceType, default: DataSourceType.MANUAL })
    source: DataSourceType;

    @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true, name: 'confidence_score' })
    confidenceScore: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'last_edited_at' })
    lastEditedAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'edited_by_user_id' })
    editedByUserId: string;
}
