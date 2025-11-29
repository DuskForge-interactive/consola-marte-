import { ApiProperty } from '@nestjs/swagger';

export class UpdatePopulationDto {
  @ApiProperty({
    example: 24,
    description: 'Total number of colonists currently in the habitat',
  })
  population: number;
}
