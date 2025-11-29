import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResourceDto {
  @ApiPropertyOptional({
    example: 'Oxígeno (O₂)',
    description: 'New display name for the resource',
  })
  displayName?: string;

  @ApiPropertyOptional({
    example: 'L',
    description: 'Updated measurement unit',
  })
  unit?: string;

  @ApiPropertyOptional({
    example: 4100,
    description: 'Updated current amount available',
  })
  currentAmount?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Updated maximum storage capacity',
  })
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: 2.1,
    description: 'Updated per-capita consumption per hour',
  })
  perCapitaConsumptionPerHour?: number;

  @ApiPropertyOptional({
    example: 72,
    description: 'Updated safety window in hours',
  })
  safeWindowHours?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Force the critical flag to a specific value',
  })
  isCritical?: boolean;
}
