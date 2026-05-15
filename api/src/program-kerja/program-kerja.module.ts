import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ProgramKerjaController } from './program-kerja.controller';
import { ProgramKerjaService } from './program-kerja.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [ProgramKerjaController],
  providers: [ProgramKerjaService],
})
export class ProgramKerjaModule {}
