import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MinioModule } from '../minio/minio.module';
import { UploadService } from './upload.service';

@Module({
  imports: [MinioModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
