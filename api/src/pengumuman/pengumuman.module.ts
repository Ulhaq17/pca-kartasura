import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PengumumanController } from './pengumuman.controller';
import { PengumumanService } from './pengumuman.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PengumumanController],
  providers: [PengumumanService],
})
export class PengumumanModule {}
