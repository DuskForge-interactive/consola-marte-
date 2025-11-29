import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateResourceDto {
  @ApiPropertyOptional({
    example: 'Oxígeno (O₂)',
    description: 'New display name for the resource',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    example: 75.2,
    description: 'New current percentage value',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  currentPercentage?: number;

  @ApiPropertyOptional({
    example: 18,
    description: 'New critical threshold percentage',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  criticalPercentage?: number;

  @ApiPropertyOptional({
    example: 0.21,
    description: 'New consumption rate per minute',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  consumptionRatePerMinute?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Force the critical flag to a specific value',
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}
