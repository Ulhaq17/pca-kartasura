import { Module } from '@nestjs/common';
import { ProfilSejarahService } from './profil-sejarah.service';
import { ProfilSejarahController } from './profil-sejarah.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [ProfilSejarahController],
  providers: [ProfilSejarahService],
})
export class ProfilSejarahModule {}
