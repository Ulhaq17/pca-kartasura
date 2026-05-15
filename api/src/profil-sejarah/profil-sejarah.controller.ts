import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilSejarahService } from './profil-sejarah.service';
import { StorageService } from '../storage/storage.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import { CreateProfilSejarahDto } from './dto/create-profil-sejarah.dto';
import { UpdateProfilSejarahDto } from './dto/update-profil-sejarah.dto';

@Controller('profil-sejarah')
export class ProfilSejarahController {
  constructor(
    private readonly profilSejarahService: ProfilSejarahService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreateProfilSejarahDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.foto = await this.storageService.uploadFile(file);
    }
    return this.profilSejarahService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.profilSejarahService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilSejarahService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfilSejarahDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.profilSejarahService.findOne(id);
      if (existing.foto) {
        await this.storageService.deleteFile(existing.foto);
      }
      dto.foto = await this.storageService.uploadFile(file);
    }
    return this.profilSejarahService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilSejarahService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.profilSejarahService.getHistory(id);
  }
}
