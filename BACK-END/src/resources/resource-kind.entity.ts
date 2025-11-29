import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResourceStatus } from './resource-status.entity';

@Entity({ schema: 'mars_console', name: 'resource_kinds' })
export class ResourceKind {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  display_name: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  default_critical_percentage: string;

  @Column({ type: 'numeric', precision: 6, scale: 3 })
  default_consumption_rate_per_minute: string;

  @Column({ default: 'unit' })
  unit: string;

  @Column({ type: 'numeric', precision: 10, scale: 4, default: 0 })
  per_person_rate_per_minute: string;

  @OneToMany(() => ResourceStatus, (status) => status.kind)
  statuses: ResourceStatus[];
}
