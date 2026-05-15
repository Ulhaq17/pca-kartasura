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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import { StorageService } from '../storage/storage.service';
import { CreateMajelisLembagaDto } from './dto/create-majelis-lembaga.dto';
import { UpdateMajelisLembagaDto } from './dto/update-majelis-lembaga.dto';
import { MajelisLembagaService } from './majelis-lembaga.service';

type MajelisLembagaFiles = {
  fotoKetua?: Express.Multer.File[];
  sampulMajelis?: Express.Multer.File[];
};

@Controller('majelis-lembaga')
export class MajelisLembagaController {
  constructor(
    private readonly majelisLembagaService: MajelisLembagaService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotoKetua', maxCount: 1 },
      { name: 'sampulMajelis', maxCount: 1 },
    ]),
  )
  async create(
    @Body() dto: CreateMajelisLembagaDto,
    @UploadedFiles() files: MajelisLembagaFiles,
  ) {
    if (files?.fotoKetua?.[0]) {
      dto.fotoKetua = await this.storageService.uploadFile(files.fotoKetua[0]);
    }

    if (files?.sampulMajelis?.[0]) {
      dto.sampulMajelis = await this.storageService.uploadFile(
        files.sampulMajelis[0],
      );
    }

    return this.majelisLembagaService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.majelisLembagaService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.majelisLembagaService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.majelisLembagaService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotoKetua', maxCount: 1 },
      { name: 'sampulMajelis', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMajelisLembagaDto,
    @UploadedFiles() files: MajelisLembagaFiles,
  ) {
    const existing = await this.majelisLembagaService.findOne(id);

    if (files?.fotoKetua?.[0]) {
      if (existing.fotoKetua) {
        await this.storageService.deleteFile(existing.fotoKetua);
      }
      dto.fotoKetua = await this.storageService.uploadFile(files.fotoKetua[0]);
    }

    if (files?.sampulMajelis?.[0]) {
      if (existing.sampulMajelis) {
        await this.storageService.deleteFile(existing.sampulMajelis);
      }
      dto.sampulMajelis = await this.storageService.uploadFile(
        files.sampulMajelis[0],
      );
    }

    return this.majelisLembagaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.majelisLembagaService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.majelisLembagaService.getHistory(id);
  }
}
