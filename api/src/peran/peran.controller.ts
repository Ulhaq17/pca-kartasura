import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import { CreatePeranDto } from './dto/create-peran.dto';
import { UpdatePeranDto } from './dto/update-peran.dto';
import { PeranService } from './peran.service';

@Controller('peran')
export class PeranController {
  constructor(private readonly peranService: PeranService) {}

  @Post()
  create(@Body() dto: CreatePeranDto) {
    return this.peranService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.peranService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.peranService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePeranDto) {
    return this.peranService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.peranService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.peranService.getHistory(id);
  }
}
