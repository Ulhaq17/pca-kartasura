import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaModule } from '../shared/media/media.module';
import { StorageModule } from '../storage/storage.module';
import { PengumumanController } from './pengumuman.controller';
import { PengumumanService } from './pengumuman.service';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule, MediaModule],
  controllers: [PengumumanController],
  providers: [PengumumanService],
})
export class PengumumanModule {}
