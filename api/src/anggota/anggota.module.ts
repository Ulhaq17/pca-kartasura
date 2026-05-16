import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AnggotaController } from './anggota.controller';
import { AnggotaService } from './anggota.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnggotaController],
  providers: [AnggotaService, AuditService],
})
export class AnggotaModule {}
