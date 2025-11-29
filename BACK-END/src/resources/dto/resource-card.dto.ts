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

  @ApiProperty({ example: 'L', description: 'Unit of measurement' })
  unit: string;

  @ApiProperty({
    example: 58.2,
    description: 'Current amount available (unit defined by resource)',
    nullable: true,
  })
  currentQuantity: number | null;

  @ApiProperty({
    example: 5000,
    description: 'Maximum storage capacity for the resource',
    nullable: true,
  })
  maxCapacity: number | null;

  @ApiProperty({
    example: 20,
    description:
      'Percentage at which the safety window is exhausted (derived from consumption)',
  })
  criticalPercentage: number;

  @ApiProperty({ example: false, description: 'Whether resource is critical' })
  isCritical: boolean;

  @ApiProperty({
    example: 48,
    description: 'Remaining autonomy in hours at the current consumption',
    nullable: true,
  })
  autonomyHours: number | null;

  @ApiProperty({
    example: 90,
    description: 'Net consumption rate per hour for the whole population',
  })
  totalConsumptionPerHour: number;

  @ApiProperty({
    example: 2.1,
    description: 'Per-capita consumption per hour',
  })
  perCapitaConsumptionPerHour: number;

  @ApiProperty({
    example: 72,
    description: 'Safety window in hours used for critical threshold',
  })
  safeWindowHours: number;

  @ApiProperty({
    example: 6480,
    description: 'Amount reserved for the safety window',
  })
  safetyStockAmount: number;

  @ApiProperty({
    example: 14,
    description: 'Current population accounted for in calculations',
  })
  population: number;

  @ApiProperty({
    example: '2025-11-29T16:00:00.000Z',
    description: 'Last update timestamp',
  })
  lastUpdated: Date;
}
