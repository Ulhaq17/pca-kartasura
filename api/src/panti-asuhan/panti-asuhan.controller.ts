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
import { CreatePantiAsuhanDto } from './dto/create-panti-asuhan.dto';
import { UpdatePantiAsuhanDto } from './dto/update-panti-asuhan.dto';
import { PantiAsuhanService } from './panti-asuhan.service';

@Controller('panti-asuhan')
export class PantiAsuhanController {
  constructor(
    private readonly pantiAsuhanService: PantiAsuhanService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'foto' }, CreatePantiAsuhanDto)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreatePantiAsuhanDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Foto wajib diunggah');
    }

    dto.foto = await this.storageService.uploadFile(file);
    return this.pantiAsuhanService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.pantiAsuhanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pantiAsuhanService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'foto', required: false }, UpdatePantiAsuhanDto)
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePantiAsuhanDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const existing = await this.pantiAsuhanService.findOne(id);
      await this.storageService.deleteFile(existing.foto);
      dto.foto = await this.storageService.uploadFile(file);
    }

    return this.pantiAsuhanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pantiAsuhanService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.pantiAsuhanService.getHistory(id);
  }
}
