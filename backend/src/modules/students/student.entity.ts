import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from '../sections/section.entity';

@Entity('students')
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'roll_number', unique: true })
    rollNumber: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @ManyToOne(() => Section, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'section_id', nullable: true })
    sectionId: number;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
