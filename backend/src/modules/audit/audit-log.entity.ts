import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'table_name' })
    tableName: string;

    @Column({ name: 'record_id' })
    recordId: number;

    @Column({ name: 'field_changed' })
    fieldChanged: string;

    @Column({ type: 'text', nullable: true, name: 'old_value' })
    oldValue: string;

    @Column({ type: 'text', nullable: true, name: 'new_value' })
    newValue: string;

    @Column({ type: 'uuid', nullable: true, name: 'changed_by_user_id' })
    changedByUserId: string;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;
}
