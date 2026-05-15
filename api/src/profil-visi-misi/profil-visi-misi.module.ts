import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfilVisiMisiController } from './profil-visi-misi.controller';
import { ProfilVisiMisiService } from './profil-visi-misi.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ProfilVisiMisiController],
  providers: [ProfilVisiMisiService],
})
export class ProfilVisiMisiModule {}
