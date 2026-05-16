import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { PantiAsuhanController } from './panti-asuhan.controller';
import { PantiAsuhanService } from './panti-asuhan.service';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [PantiAsuhanController],
  providers: [PantiAsuhanService],
})
export class PantiAsuhanModule {}
