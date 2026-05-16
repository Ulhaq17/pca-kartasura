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
import { StorageService } from '../storage/storage.service';
import { CreateProgramKerjaDto } from './dto/create-program-kerja.dto';
import { FindProgramKerjaQueryDto } from './dto/find-program-kerja-query.dto';
import { UpdateProgramKerjaDto } from './dto/update-program-kerja.dto';
import { ProgramKerjaService } from './program-kerja.service';

@Controller('program-kerja')
export class ProgramKerjaController {
  constructor(
    private readonly programKerjaService: ProgramKerjaService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'foto' }, CreateProgramKerjaDto)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreateProgramKerjaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Foto wajib diunggah');
    }

    dto.foto = await this.storageService.uploadFile(file);
    return this.programKerjaService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindProgramKerjaQueryDto) {
    return this.programKerjaService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.programKerjaService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programKerjaService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'foto', required: false }, UpdateProgramKerjaDto)
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramKerjaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.programKerjaService.findOne(id);
      await this.storageService.deleteFile(existing.foto);
      dto.foto = await this.storageService.uploadFile(file);
    }

    return this.programKerjaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programKerjaService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.programKerjaService.getHistory(id);
  }
}
