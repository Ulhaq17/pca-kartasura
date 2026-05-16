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
import { CreatePengumumanDto } from './dto/create-pengumuman.dto';
import { UpdatePengumumanDto } from './dto/update-pengumuman.dto';
import { PengumumanService } from './pengumuman.service';

@Controller('pengumuman')
export class PengumumanController {
  constructor(private readonly pengumumanService: PengumumanService) {}

  @Post()
  create(@Body() dto: CreatePengumumanDto) {
    return this.pengumumanService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.pengumumanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePengumumanDto,
  ) {
    return this.pengumumanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.getHistory(id);
  }
}
