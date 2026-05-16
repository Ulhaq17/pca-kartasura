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
import { CreateProfilStrukturOrganisasiDto } from './dto/create-profil-struktur-organisasi.dto';
import { UpdateProfilStrukturOrganisasiDto } from './dto/update-profil-struktur-organisasi.dto';
import { ProfilStrukturOrganisasiService } from './profil-struktur-organisasi.service';

@Controller('profil-struktur-organisasi')
export class ProfilStrukturOrganisasiController {
  constructor(
    private readonly profilStrukturOrganisasiService: ProfilStrukturOrganisasiService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'foto' }, CreateProfilStrukturOrganisasiDto)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreateProfilStrukturOrganisasiDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Foto wajib diunggah');
    }

    dto.foto = await this.storageService.uploadFile(file);
    return this.profilStrukturOrganisasiService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.profilStrukturOrganisasiService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilStrukturOrganisasiService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'foto' }, UpdateProfilStrukturOrganisasiDto)
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfilStrukturOrganisasiDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Foto wajib diunggah');
    }

    const existing = await this.profilStrukturOrganisasiService.findOne(id);
    await this.storageService.deleteFile(existing.foto);

    dto.foto = await this.storageService.uploadFile(file);
    return this.profilStrukturOrganisasiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilStrukturOrganisasiService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.profilStrukturOrganisasiService.getHistory(id);
  }
}
