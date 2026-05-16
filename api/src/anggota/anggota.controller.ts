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
import { AnggotaService } from './anggota.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { UpdateAnggotaDto } from './dto/update-anggota.dto';

@Controller('anggota')
export class AnggotaController {
  constructor(private readonly anggotaService: AnggotaService) {}

  @Post()
  create(@Body() dto: CreateAnggotaDto) {
    return this.anggotaService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.anggotaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.anggotaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAnggotaDto) {
    return this.anggotaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.anggotaService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.anggotaService.getHistory(id);
  }
}
