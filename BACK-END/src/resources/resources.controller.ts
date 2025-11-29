import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { ResourceCardDto } from './dto/resource-card.dto';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOkResponse({
    type: ResourceCardDto,
    isArray: true,
    description: 'Get all resources for dashboard',
  })
  async getAll(): Promise<ResourceCardDto[]> {
    return this.resourcesService.getAllForDashboard();
  }

  @Get(':code')
  @ApiParam({
    name: 'code',
    example: 'OXYGEN',
    description: 'Resource code (e.g. OXYGEN, WATER, FOOD, ENERGY)',
  })
  @ApiOkResponse({
    type: ResourceCardDto,
    description: 'Get a single resource by code',
  })
  async getByCode(@Param('code') code: string): Promise<ResourceCardDto> {
    return this.resourcesService.getByCode(code.toUpperCase());
  }
}
