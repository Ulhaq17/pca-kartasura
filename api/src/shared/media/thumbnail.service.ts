import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export type GeneratedThumbnail = {
  buffer: Buffer;
  fileName: string;
  mimeType: 'image/webp';
};

@Injectable()
export class ThumbnailService {
  async generateFromFile(
    file: Express.Multer.File,
  ): Promise<GeneratedThumbnail> {
    const buffer = await this.generateBuffer(file);

    return {
      buffer,
      fileName: `${randomUUID()}-thumb.webp`,
      mimeType: 'image/webp',
    };
  }

  private async generateBuffer(file: Express.Multer.File): Promise<Buffer> {
    try {
      if (file.mimetype.startsWith('image/')) {
        return this.createImageThumbnail(file.buffer);
      }

      if (file.mimetype === 'application/pdf') {
        return this.createPdfThumbnail(file.buffer, file.originalname);
      }
    } catch {
      throw new BadRequestException('Gagal membuat thumbnail dari file');
    }

    throw new BadRequestException('File harus berupa gambar atau PDF');
  }

  private async createImageThumbnail(buffer: Buffer) {
    return sharp(buffer)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }

  private async createPdfThumbnail(
    pdfBuffer: Buffer,
    originalName: string,
  ): Promise<Buffer> {
    const canvasModule = await import('@napi-rs/canvas');
    this.registerPdfCanvasPolyfills(canvasModule);

    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = getDocument({
      data: new Uint8Array(pdfBuffer),
      isOffscreenCanvasSupported: false,
    });
    const pdf = await loadingTask.promise;

    try {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasModule.createCanvas(viewport.width, viewport.height);
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
      return this.createPdfFallbackThumbnail(originalName);
    } finally {
      await pdf.destroy();
    }
  }

  private registerPdfCanvasPolyfills(
    canvasModule: typeof import('@napi-rs/canvas'),
  ) {
    globalThis.DOMMatrix ??= canvasModule.DOMMatrix as never;
    globalThis.ImageData ??= canvasModule.ImageData as never;
    globalThis.Path2D ??= canvasModule.Path2D as never;
  }

  private async createPdfFallbackThumbnail(originalName: string) {
    const safeName = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[<>&"']/g, '')
      .slice(0, 42);
    const svg = `
      <svg width="720" height="480" viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg">
        <rect width="720" height="480" rx="32" fill="#f8fafc"/>
        <rect x="96" y="64" width="260" height="352" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <path d="M276 64v92h80" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/>
        <rect x="136" y="202" width="180" height="22" rx="11" fill="#e2e8f0"/>
        <rect x="136" y="248" width="148" height="22" rx="11" fill="#e2e8f0"/>
        <rect x="136" y="294" width="116" height="22" rx="11" fill="#e2e8f0"/>
        <text x="408" y="206" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#dc2626">PDF</text>
        <text x="408" y="266" font-family="Arial, sans-serif" font-size="26" fill="#475569">${safeName}</text>
      </svg>`;

    return sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
  }
}
