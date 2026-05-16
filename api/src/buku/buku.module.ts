import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaModule } from '../shared/media/media.module';
import { StorageModule } from '../storage/storage.module';
import { BukuController } from './buku.controller';
import { BukuService } from './buku.service';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule, MediaModule],
  controllers: [BukuController],
  providers: [BukuService],
})
export class BukuModule {}
