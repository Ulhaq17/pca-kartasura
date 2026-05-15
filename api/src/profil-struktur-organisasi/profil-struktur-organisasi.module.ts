import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ProfilStrukturOrganisasiController } from './profil-struktur-organisasi.controller';
import { ProfilStrukturOrganisasiService } from './profil-struktur-organisasi.service';

@Module({
  imports: [PrismaModule, StorageModule, AuditModule],
  controllers: [ProfilStrukturOrganisasiController],
  providers: [ProfilStrukturOrganisasiService],
})
export class ProfilStrukturOrganisasiModule {}
