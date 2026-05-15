import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProfilVisiMisiDto } from './dto/create-profil-visi-misi.dto';
import { UpdateProfilVisiMisiDto } from './dto/update-profil-visi-misi.dto';
import { ProfilVisiMisiService } from './profil-visi-misi.service';

@Controller('profil-visi-misi')
export class ProfilVisiMisiController {
  constructor(private readonly profilVisiMisiService: ProfilVisiMisiService) {}

  @Post()
  create(@Body() dto: CreateProfilVisiMisiDto) {
    return this.profilVisiMisiService.create(dto);
  }

  @Get()
  findAll() {
    return this.profilVisiMisiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilVisiMisiService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfilVisiMisiDto,
  ) {
    return this.profilVisiMisiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilVisiMisiService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.profilVisiMisiService.getHistory(id);
  }
}
