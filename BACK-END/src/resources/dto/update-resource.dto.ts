import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResourceDto {
  @ApiPropertyOptional({
    example: 'Oxígeno (O₂)',
    description: 'New display name for the resource',
  })
  displayName?: string;

  @ApiPropertyOptional({
    example: 75.2,
    description: 'New current percentage value',
  })
  currentPercentage?: number;

  @ApiPropertyOptional({
    example: 18,
    description: 'New critical threshold percentage',
  })
  criticalPercentage?: number;

  @ApiPropertyOptional({
    example: 0.21,
    description: 'New consumption rate per minute',
  })
  consumptionRatePerMinute?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Force the critical flag to a specific value',
  })
  isCritical?: boolean;
}
