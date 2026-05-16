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
import { BulletinService } from './bulletin.service';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { UpdateBulletinDto } from './dto/update-bulletin.dto';

@Controller('bulletin')
export class BulletinController {
  constructor(
    private readonly bulletinService: BulletinService,
    private readonly storageService: StorageService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  @Post()
  @ApiFileUpload({ name: 'file' }, CreateBulletinDto)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateBulletinDto,
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

    return this.bulletinService.create(dto, fileUrl, thumbnailUrl);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.bulletinService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.findOne(id);
  }

  @Patch(':id')
  @ApiFileUpload({ name: 'file', required: false }, UpdateBulletinDto)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBulletinDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (!file) {
      return this.bulletinService.update(id, dto);
    }

    const existing = await this.bulletinService.findOne(id);
    const thumbnail = await this.thumbnailService.generateFromFile(file);
    const fileUrl = await this.storageService.uploadFile(file);
    const thumbnailUrl = await this.storageService.uploadBuffer(
      thumbnail.buffer,
      thumbnail.fileName,
      thumbnail.mimeType,
    );

    await this.storageService.deleteFile(existing.file);
    await this.storageService.deleteFile(existing.thumbnail);

    return this.bulletinService.update(id, dto, fileUrl, thumbnailUrl);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.getHistory(id);
  }
}
