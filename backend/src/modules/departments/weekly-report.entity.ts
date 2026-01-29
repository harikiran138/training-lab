import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('weekly_reports')
@Unique(['departmentCode', 'weekNo'])
export class WeeklyReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'department_code' })
    departmentCode: string;

    @Column({ name: 'week_no' })
    weekNo: number;

    @Column({ name: 'avg_attendance', type: 'float', nullable: true })
    avgAttendance: number;

    @Column({ name: 'avg_test_pass', type: 'float', nullable: true })
    avgTestPass: number;

    @Column({ name: 'units_covered', type: 'float', nullable: true })
    unitsCovered: number;

    @Column({ name: 'total_units', type: 'float', nullable: true })
    totalUnits: number;

    @Column({ name: 'risk_level', nullable: true })
    riskLevel: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
