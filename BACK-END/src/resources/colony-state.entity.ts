import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'mars_console', name: 'colony_state' })
export class ColonyState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  current_population: number;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;
}
