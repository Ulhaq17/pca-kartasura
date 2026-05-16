import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaModule } from '../shared/media/media.module';
import { StorageModule } from '../storage/storage.module';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';

@Module({
  imports: [PrismaModule, AuditModule, StorageModule, MediaModule],
  controllers: [BulletinController],
  providers: [BulletinService],
})
export class BulletinModule {}
