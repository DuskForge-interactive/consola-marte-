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
    example: 'L',
    description: 'Unit used to measure the resource (L, kg, kWh, etc.)',
  })
  unit: string;

  @ApiProperty({
    example: 4200,
    description: 'Current amount available for this resource',
  })
  currentAmount: number;

  @ApiProperty({
    example: 5000,
    description: 'Maximum storage capacity for this resource',
  })
  maxCapacity: number;

  @ApiProperty({
    example: 2.1,
    description:
      'Per-capita consumption per hour (same units as the resource, e.g. L/h/person)',
  })
  perCapitaConsumptionPerHour: number;

  @ApiProperty({
    example: 72,
    required: false,
    description: 'Safety window in hours the stock should cover',
  })
  safeWindowHours?: number;

  @ApiProperty({
    required: false,
    example: false,
    description:
      'Optional override for current critical state; defaults to comparing current vs critical thresholds',
  })
  isCritical?: boolean;
}
