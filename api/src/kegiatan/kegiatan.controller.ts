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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { FindKegiatanQueryDto } from './dto/find-kegiatan-query.dto';
import { UpdateKegiatanDto } from './dto/update-kegiatan.dto';
import { KegiatanService } from './kegiatan.service';

@Controller('kegiatan')
export class KegiatanController {
  constructor(
    private readonly kegiatanService: KegiatanService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('foto', 4))
  async create(
    @Body() dto: CreateKegiatanDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      throw new BadRequestException('Minimal satu foto wajib diunggah');
    }

    if (files.length > 4) {
      throw new BadRequestException('Maksimal 4 foto dapat diunggah');
    }

    dto.foto = await Promise.all(
      files.map((file) => this.storageService.uploadFile(file)),
    );
    return this.kegiatanService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindKegiatanQueryDto) {
    return this.kegiatanService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.kegiatanService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('foto', 4))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKegiatanDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files?.length) {
      if (files.length > 4) {
        throw new BadRequestException('Maksimal 4 foto dapat diunggah');
      }

      const existing = await this.kegiatanService.findOne(id);
      await Promise.all(
        existing.foto.map((fileUrl) => this.storageService.deleteFile(fileUrl)),
      );
      dto.foto = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file)),
      );
    }

    return this.kegiatanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.getHistory(id);
  }
}
