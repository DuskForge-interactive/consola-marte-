import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({
    example: 'OXYGEN',
    description: 'Unique code for the resource',
  })
  code: string;

  @ApiProperty({
    example: 'Oxígeno (O₂)',
    description: 'Display name for dashboards',
  })
  displayName: string;

  @ApiProperty({
    example: 82.5,
    description: 'Current percentage (0-100)',
  })
  currentPercentage: number;

  @ApiProperty({
    example: 20,
    description: 'Critical threshold percentage',
  })
  criticalPercentage: number;

  @ApiProperty({
    example: 0.25,
    description: 'Consumption rate per minute',
  })
  consumptionRatePerMinute: number;

  @ApiProperty({
    required: false,
    example: false,
    description:
      'Optional override for current critical state; defaults to comparing current vs critical thresholds',
  })
  isCritical?: boolean;
}
