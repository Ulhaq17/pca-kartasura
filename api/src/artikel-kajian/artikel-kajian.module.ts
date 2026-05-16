import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ArtikelKajianController } from './artikel-kajian.controller';
import { ArtikelKajianService } from './artikel-kajian.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [ArtikelKajianController],
  providers: [ArtikelKajianService],
})
export class ArtikelKajianModule {}
