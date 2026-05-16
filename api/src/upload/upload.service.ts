import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { MinioService } from '../minio/minio.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class UploadService {
  constructor(private readonly minioService: MinioService) {}

  async uploadFile(file: Express.Multer.File): Promise<UploadResponseDto> {
    if (file.mimetype === 'application/pdf') {
      return this.uploadPdf(file);
    }

    return this.uploadImage(file);
  }

  private async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const compressedBuffer = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();
    const fileName = `${uuidv4()}.webp`;
    const url = await this.minioService.uploadFile(
      compressedBuffer,
      fileName,
      'image/webp',
    );

    return {
      success: true,
      url,
      thumbnailUrl: url,
      originalName: file.originalname,
      size: compressedBuffer.length,
      mimeType: 'image/webp',
    };
  }

  private async uploadPdf(
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const pdfFileName = `${uuidv4()}.pdf`;
    const thumbnailFileName = `${uuidv4()}-thumb.webp`;

    const [url, thumbnailBuffer] = await Promise.all([
      this.minioService.uploadFile(file.buffer, pdfFileName, file.mimetype),
      this.createPdfFirstPageThumbnail(file.buffer),
    ]);

    const thumbnailUrl = await this.minioService.uploadFile(
      thumbnailBuffer,
      thumbnailFileName,
      'image/webp',
    );

    return {
      success: true,
      url,
      thumbnailUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  private async createPdfFirstPageThumbnail(
    pdfBuffer: Buffer,
  ): Promise<Buffer> {
    try {
      const [{ getDocument }, { createCanvas }] = await Promise.all([
        import('pdfjs-dist/legacy/build/pdf.mjs'),
        import('@napi-rs/canvas'),
      ]);
      const loadingTask = getDocument({
        data: new Uint8Array(pdfBuffer),
      });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const canvasContext = canvas.getContext('2d');

      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvas: null,
        canvasContext: canvasContext as never,
        viewport,
      }).promise;

      const firstPageImage = canvas.toBuffer('image/png');

      return sharp(firstPageImage)
        .resize({ width: 720, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Failed to generate PDF thumbnail');
    }
  }
}
