import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgendaModule } from './agenda/agenda.module';
import { AnggotaModule } from './anggota/anggota.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtikelKajianModule } from './artikel-kajian/artikel-kajian.module';
import { ArtikelKegiatanModule } from './artikel-kegiatan/artikel-kegiatan.module';
import { BulletinModule } from './bulletin/bulletin.module';
import { BukuModule } from './buku/buku.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { MajelisLembagaModule } from './majelis-lembaga/majelis-lembaga.module';
import { PeranModule } from './peran/peran.module';
import { PantiAsuhanModule } from './panti-asuhan/panti-asuhan.module';
import { PengumumanModule } from './pengumuman/pengumuman.module';
import { ProfilSejarahModule } from './profil-sejarah/profil-sejarah.module';
import { ProfilStrukturOrganisasiModule } from './profil-struktur-organisasi/profil-struktur-organisasi.module';
import { ProfilVisiMisiModule } from './profil-visi-misi/profil-visi-misi.module';
import { ProgramKerjaModule } from './program-kerja/program-kerja.module';
import { SekolahModule } from './sekolah/sekolah.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AgendaModule,
    AnggotaModule,
    ArtikelKajianModule,
    ArtikelKegiatanModule,
    BulletinModule,
    BukuModule,
    PrismaModule,
    HealthModule,
    KegiatanModule,
    MajelisLembagaModule,
    PeranModule,
    PantiAsuhanModule,
    PengumumanModule,
    ProfilSejarahModule,
    ProfilStrukturOrganisasiModule,
    ProfilVisiMisiModule,
    ProgramKerjaModule,
    SekolahModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
