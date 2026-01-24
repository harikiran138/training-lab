import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Department } from '../departments/department.entity';

@Entity('sections')
@Unique(['department', 'name'])
export class Section {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Department, (department) => department.sections, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ name: 'department_id' })
    departmentId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
