import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResourceStatus } from './resource-status.entity';

@Entity({ schema: 'mars_console', name: 'resource_history' })
export class ResourceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  status_id: string;

  @ManyToOne(() => ResourceStatus, (status) => status.history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'status_id' })
  status: ResourceStatus;

  @Column({ type: 'timestamptz' })
  measured_at: Date;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  percentage: string;

  @Column({ type: 'boolean' })
  is_critical: boolean;

  @Column({ type: 'text' })
  event_type: string;

  @Column({ type: 'text', nullable: true })
  note?: string;
}
