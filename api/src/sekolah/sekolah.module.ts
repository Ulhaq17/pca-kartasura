import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SekolahController } from './sekolah.controller';
import { SekolahService } from './sekolah.service';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [SekolahController],
  providers: [SekolahService],
})
export class SekolahModule {}
