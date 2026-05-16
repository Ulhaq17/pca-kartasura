import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PeranController } from './peran.controller';
import { PeranService } from './peran.service';

@Module({
  imports: [PrismaModule],
  controllers: [PeranController],
  providers: [PeranService, AuditService],
})
export class PeranModule {}
