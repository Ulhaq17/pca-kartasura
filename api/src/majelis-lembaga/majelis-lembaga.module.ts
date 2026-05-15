import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { MajelisLembagaController } from './majelis-lembaga.controller';
import { MajelisLembagaService } from './majelis-lembaga.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [MajelisLembagaController],
  providers: [MajelisLembagaService],
})
export class MajelisLembagaModule {}
