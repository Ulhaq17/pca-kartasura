import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ProfilSejarahModule } from './profil-sejarah/profil-sejarah.module';
import { ProfilVisiMisiModule } from './profil-visi-misi/profil-visi-misi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    ProfilSejarahModule,
    ProfilVisiMisiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
