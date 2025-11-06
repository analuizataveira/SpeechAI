import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DiffTypesService } from './diff-types.service';
import { CreateDiffTypeDto } from './dtos/create-diff-type.dto';
import { UpdateDiffTypeDto } from './dtos/update-diff-type.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';

@ApiTags('Diff Types')
@Controller('diff-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DiffTypesController {
  constructor(private readonly diffTypesService: DiffTypesService) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a difficulty type' })
  create(@Body() createDiffTypeDto: CreateDiffTypeDto) {
    return this.diffTypesService.create(createDiffTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all difficulty types' })
  findAll() {
    return this.diffTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a difficulty type by id' })
  findOne(@Param('id') id: string) {
    return this.diffTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update a difficulty type' })
  update(
    @Param('id') id: string,
    @Body() updateDiffTypeDto: UpdateDiffTypeDto,
  ) {
    return this.diffTypesService.update(id, updateDiffTypeDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a difficulty type' })
  remove(@Param('id') id: string) {
    return this.diffTypesService.remove(id);
  }
}
