import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgendaModule } from './agenda/agenda.module';
import { AnggotaModule } from './anggota/anggota.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtikelKajianModule } from './artikel-kajian/artikel-kajian.module';
import { ArtikelKegiatanModule } from './artikel-kegiatan/artikel-kegiatan.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { MajelisLembagaModule } from './majelis-lembaga/majelis-lembaga.module';
import { PeranModule } from './peran/peran.module';
import { ProfilSejarahModule } from './profil-sejarah/profil-sejarah.module';
import { ProfilStrukturOrganisasiModule } from './profil-struktur-organisasi/profil-struktur-organisasi.module';
import { ProfilVisiMisiModule } from './profil-visi-misi/profil-visi-misi.module';
import { ProgramKerjaModule } from './program-kerja/program-kerja.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AgendaModule,
    AnggotaModule,
    ArtikelKajianModule,
    ArtikelKegiatanModule,
    PrismaModule,
    HealthModule,
    KegiatanModule,
    MajelisLembagaModule,
    PeranModule,
    ProfilSejarahModule,
    ProfilStrukturOrganisasiModule,
    ProfilVisiMisiModule,
    ProgramKerjaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
