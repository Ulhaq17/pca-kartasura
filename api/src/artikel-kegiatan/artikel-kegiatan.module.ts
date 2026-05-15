import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ArtikelKegiatanController } from './artikel-kegiatan.controller';
import { ArtikelKegiatanService } from './artikel-kegiatan.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [ArtikelKegiatanController],
  providers: [ArtikelKegiatanService],
})
export class ArtikelKegiatanModule {}
