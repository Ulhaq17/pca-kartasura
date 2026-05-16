import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';

@Module({
  imports: [PrismaModule],
  controllers: [AgendaController],
  providers: [AgendaService, AuditService],
})
export class AgendaModule {}
