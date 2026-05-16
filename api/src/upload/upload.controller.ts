import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiFileUpload } from '../shared/decorators/api-file-upload.decorator';
import { MinioService } from '../minio/minio.service';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponseDto } from './dto/upload-response.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Post()
  @ApiFileUpload({ name: 'file' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: any,
  ): Promise<UploadResponseDto> {
    try {
      // 1. Compress using sharp
      // We convert to webp and compress
      const compressedBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const fileName = `${uuidv4()}.webp`;
      const mimeType = 'image/webp';

      // 2. Upload to MinIO
      const url = await this.minioService.uploadFile(
        compressedBuffer,
        fileName,
        mimeType,
      );

      return {
        success: true,
        url,
        originalName: file.originalname,
        size: compressedBuffer.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
