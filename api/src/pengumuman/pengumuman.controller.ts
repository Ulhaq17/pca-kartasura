import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { ThumbnailService } from '../shared/media/thumbnail.service';
import { StorageService } from '../storage/storage.service';
import { CreatePengumumanDto } from './dto/create-pengumuman.dto';
import { UpdatePengumumanDto } from './dto/update-pengumuman.dto';
import { PengumumanService } from './pengumuman.service';

@Controller('pengumuman')
export class PengumumanController {
  constructor(
    private readonly pengumumanService: PengumumanService,
    private readonly storageService: StorageService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'file' }, CreatePengumumanDto)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreatePengumumanDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File wajib diunggah');
    }

    const thumbnail = await this.thumbnailService.generateFromFile(file);
    const fileUrl = await this.storageService.uploadFile(file);
    const thumbnailUrl = await this.storageService.uploadBuffer(
      thumbnail.buffer,
      thumbnail.fileName,
      thumbnail.mimeType,
    );

    return this.pengumumanService.create(dto, fileUrl, thumbnailUrl);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.pengumumanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'file', required: false }, UpdatePengumumanDto)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePengumumanDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (!file) {
      return this.pengumumanService.update(id, dto);
    }

    const existing = await this.pengumumanService.findOne(id);
    const thumbnail = await this.thumbnailService.generateFromFile(file);
    const fileUrl = await this.storageService.uploadFile(file);
    const thumbnailUrl = await this.storageService.uploadBuffer(
      thumbnail.buffer,
      thumbnail.fileName,
      thumbnail.mimeType,
    );

    await this.storageService.deleteFile(existing.file);
    await this.storageService.deleteFile(existing.thumbnail);

    return this.pengumumanService.update(id, dto, fileUrl, thumbnailUrl);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.pengumumanService.getHistory(id);
  }
}
