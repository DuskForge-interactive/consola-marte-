import { ApiProperty } from '@nestjs/swagger';

export class ResourceHistoryPointDto {
  @ApiProperty({
    example: '2025-11-29T16:00:00.000Z',
    description: 'Timestamp for the measurement',
  })
  timestamp: Date;

  @ApiProperty({
    example: 72.5,
    description: 'Percentage recorded for the resource',
  })
  percentage: number;

  @ApiProperty({
    example: false,
    description: 'Whether the resource was critical at that time',
  })
  isCritical: boolean;
}
