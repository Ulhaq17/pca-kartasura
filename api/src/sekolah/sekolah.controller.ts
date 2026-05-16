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
import { ApiFileUpload } from '../shared/decorators/api-file-upload.decorator';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import { StorageService } from '../storage/storage.service';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { UpdateSekolahDto } from './dto/update-sekolah.dto';
import { SekolahService } from './sekolah.service';

@Controller('sekolah')
export class SekolahController {
  constructor(
    private readonly sekolahService: SekolahService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'foto' }, CreateSekolahDto)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreateSekolahDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Foto wajib diunggah');
    }

    dto.foto = await this.storageService.uploadFile(file);
    return this.sekolahService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.sekolahService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'foto', required: false }, UpdateSekolahDto)
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSekolahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.sekolahService.findOne(id);
      await this.storageService.deleteFile(existing.foto);
      dto.foto = await this.storageService.uploadFile(file);
    }

    return this.sekolahService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.getHistory(id);
  }
}
