import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResourceKind } from './resource-kind.entity';
import { ResourceHistory } from './resource-history.entity';

@Entity({ schema: 'mars_console', name: 'resource_status' })
export class ResourceStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kind_id: number;

  @ManyToOne(() => ResourceKind, (kind) => kind.statuses)
  @JoinColumn({ name: 'kind_id' })
  kind: ResourceKind;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  current_percentage: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  critical_percentage: string;

  @Column({ type: 'numeric', precision: 6, scale: 3 })
  consumption_rate_per_minute: string;

  @Column({ type: 'timestamptz' })
  last_updated: Date;

  @Column({ type: 'boolean', default: false })
  is_critical: boolean;

  @OneToMany(() => ResourceHistory, (history) => history.status)
  history: ResourceHistory[];
}
