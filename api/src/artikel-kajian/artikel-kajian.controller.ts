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
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import { StorageService } from '../storage/storage.service';
import { ArtikelKajianService } from './artikel-kajian.service';
import { CreateArtikelKajianDto } from './dto/create-artikel-kajian.dto';
import { UpdateArtikelKajianDto } from './dto/update-artikel-kajian.dto';

@Controller('artikel-kajian')
export class ArtikelKajianController {
  constructor(
    private readonly artikelKajianService: ArtikelKajianService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('sampul'))
  async create(
    @Body() dto: CreateArtikelKajianDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Sampul wajib diunggah');
    }

    dto.sampul = await this.storageService.uploadFile(file);
    return this.artikelKajianService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.artikelKajianService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.artikelKajianService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKajianService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('sampul'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArtikelKajianDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.artikelKajianService.findOne(id);
      await this.storageService.deleteFile(existing.sampul);
      dto.sampul = await this.storageService.uploadFile(file);
    }

    return this.artikelKajianService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKajianService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.artikelKajianService.getHistory(id);
  }
}
