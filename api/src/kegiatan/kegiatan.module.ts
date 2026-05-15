import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [KegiatanController],
  providers: [KegiatanService],
})
export class KegiatanModule {}
