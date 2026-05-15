import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { ArtikelKegiatanService } from './artikel-kegiatan.service';
import { CreateArtikelKegiatanDto } from './dto/create-artikel-kegiatan.dto';
import { FindArtikelKegiatanQueryDto } from './dto/find-artikel-kegiatan-query.dto';
import { UpdateArtikelKegiatanDto } from './dto/update-artikel-kegiatan.dto';

@Controller('artikel-kegiatan')
export class ArtikelKegiatanController {
  constructor(
    private readonly artikelKegiatanService: ArtikelKegiatanService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('sampul'))
  async create(
    @Body() dto: CreateArtikelKegiatanDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Sampul wajib diunggah');
    }

    dto.sampul = await this.storageService.uploadFile(file);
    return this.artikelKegiatanService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindArtikelKegiatanQueryDto) {
    return this.artikelKegiatanService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.artikelKegiatanService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKegiatanService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('sampul'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArtikelKegiatanDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.artikelKegiatanService.findOne(id);
      await this.storageService.deleteFile(existing.sampul);
      dto.sampul = await this.storageService.uploadFile(file);
    }

    return this.artikelKegiatanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKegiatanService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKegiatanService.getHistory(id);
  }
}
