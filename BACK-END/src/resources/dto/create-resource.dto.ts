import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResourceDto {
  @ApiProperty({
    example: 'OXYGEN',
    description: 'Unique code for the resource',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Oxígeno (O₂)',
    description: 'Display name for dashboards',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    example: 82.5,
    description: 'Current percentage (0-100)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  currentPercentage: number;

  @ApiProperty({
    example: 20,
    description: 'Critical threshold percentage',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  criticalPercentage: number;

  @ApiProperty({
    example: 0.25,
    description: 'Consumption rate per minute',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  consumptionRatePerMinute: number;

  @ApiProperty({
    required: false,
    example: false,
    description:
      'Optional override for current critical state; defaults to comparing current vs critical thresholds',
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}
