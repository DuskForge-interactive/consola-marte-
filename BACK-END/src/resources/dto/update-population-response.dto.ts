import { ApiProperty } from '@nestjs/swagger';
import { ResourceCardDto } from './resource-card.dto';

export class UpdatePopulationResponseDto {
  @ApiProperty({
    example: 32,
    description: 'Updated number of colonists accounted in the simulation',
  })
  population: number;

  @ApiProperty({
    example: '2025-11-29T16:00:00.000Z',
    description: 'Timestamp when the population update was recorded',
  })
  updatedAt: Date;

  @ApiProperty({
    type: ResourceCardDto,
    isArray: true,
    description:
      'Resource snapshots recomputed with the new population figures',
  })
  resources: ResourceCardDto[];
}
