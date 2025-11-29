import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { ResourceCardDto } from './dto/resource-card.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceHistoryPointDto } from './dto/resource-history-point.dto';
import { UpdatePopulationDto } from './dto/update-population.dto';
import { UpdatePopulationResponseDto } from './dto/update-population-response.dto';

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

  @Post()
  @ApiBody({ type: CreateResourceDto })
  @ApiCreatedResponse({
    type: ResourceCardDto,
    description: 'Create a new resource and its initial status',
  })
  async create(@Body() dto: CreateResourceDto): Promise<ResourceCardDto> {
    return this.resourcesService.createResource(dto);
  }

  @Patch(':code')
  @ApiParam({
    name: 'code',
    example: 'OXYGEN',
    description: 'Resource code to update',
  })
  @ApiBody({ type: UpdateResourceDto })
  @ApiOkResponse({
    type: ResourceCardDto,
    description: 'Updated resource data',
  })
  async update(
    @Param('code') code: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<ResourceCardDto> {
    return this.resourcesService.updateResource(code.toUpperCase(), dto);
  }

  @Delete(':code')
  @HttpCode(204)
  @ApiParam({
    name: 'code',
    example: 'OXYGEN',
    description: 'Resource code to delete',
  })
  async remove(@Param('code') code: string): Promise<void> {
    await this.resourcesService.deleteResource(code.toUpperCase());
  }

  @Get(':code/history')
  @ApiParam({
    name: 'code',
    example: 'OXYGEN',
    description: 'Resource code to retrieve history for',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'ISO timestamp to filter history from',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'ISO timestamp to filter history to',
  })
  @ApiOkResponse({
    type: ResourceHistoryPointDto,
    isArray: true,
    description: 'Historical timeline of resource percentage',
  })
  async getHistory(
    @Param('code') code: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResourceHistoryPointDto[]> {
    return this.resourcesService.getHistoryByCode(
      code.toUpperCase(),
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Patch('population/update')
  @ApiBody({ type: UpdatePopulationDto })
  @ApiOkResponse({
    type: UpdatePopulationResponseDto,
    description: 'New population snapshot with recomputed resources',
  })
  async updatePopulation(
    @Body() dto: UpdatePopulationDto,
  ): Promise<UpdatePopulationResponseDto> {
    return this.resourcesService.updatePopulation(dto.population);
  }
}
