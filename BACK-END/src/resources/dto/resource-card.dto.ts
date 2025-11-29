import { ApiProperty } from '@nestjs/swagger';

export class ResourceCardDto {
  @ApiProperty({ example: 'OXYGEN', description: 'Logical resource code' })
  id: string;

  @ApiProperty({
    example: '0b7c8c3c-3cda-4f6b-9a77-9bb4c4b5f123',
    description: 'Resource status UUID',
  })
  statusId: string;

  @ApiProperty({ example: 'Oxígeno (O₂)', description: 'Display name' })
  name: string;

  @ApiProperty({ example: 48.32, description: 'Current percentage [0-100]' })
  currentPercentage: number;

  @ApiProperty({ example: 20, description: 'Critical threshold percentage' })
  criticalPercentage: number;

  @ApiProperty({ example: false, description: 'Whether resource is critical' })
  isCritical: boolean;

  @ApiProperty({
    example: 1.5,
    description: 'Consumption rate per minute (percentage points)',
  })
  consumptionRatePerMinute: number;

  @ApiProperty({
    example: '2025-11-29T16:00:00.000Z',
    description: 'Last update timestamp',
  })
  lastUpdated: Date;
}
