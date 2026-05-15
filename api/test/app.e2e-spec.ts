import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { StorageService } from './../src/storage/storage.service';
import { PrismaService } from './../src/prisma/prisma.service';
import { TransformInterceptor } from './../src/shared/interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const mockStorageService = {
    uploadFile: jest
      .fn()
      .mockResolvedValue('http://localhost:9000/pca-bucket/test-photo.jpg'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };

  const expectPaginationMeta = (body: any) => {
    expect(body.meta.pagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number),
      hasNextPage: expect.any(Boolean),
      hasPreviousPage: expect.any(Boolean),
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new TransformInterceptor(),
    );

    await app.init();
  });

  afterAll(async () => {
    // Cleanup database
    await prisma.auditLog.deleteMany();
    await prisma.majelisLembaga.deleteMany();
    await prisma.profilSejarah.deleteMany();
    await prisma.profilStrukturOrganisasi.deleteMany();
    await prisma.profilVisiMisi.deleteMany();
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health/live (GET)', () => {
      return request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    });

    it('/api/v1/health/ready (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200);
    });
  });

  describe('MajelisLembaga (e2e)', () => {
    let createdId: number;
    let createdSlug: string;

    it('POST /api/v1/majelis-lembaga (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', 'Majelis Tabligh dan Ketarjihan')
        .field('deskripsi', 'Mengelola program dakwah dan ketarjihan.')
        .field('namaKetua', 'Siti Aminah')
        .field('bioKetua', 'Aktif dalam dakwah dan pembinaan jamaah.')
        .field('videoProfil', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .attach('fotoKetua', Buffer.from('fake-chairperson-image'), 'ketua.jpg')
        .attach(
          'sampulMajelis',
          Buffer.from('fake-cover-image'),
          'sampul.jpg',
        )
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe('majelis-tabligh-dan-ketarjihan');
      expect(response.body.data.nama).toBe('Majelis Tabligh dan Ketarjihan');
      expect(response.body.data.deskripsi).toBe(
        'Mengelola program dakwah dan ketarjihan.',
      );
      expect(response.body.data.namaKetua).toBe('Siti Aminah');
      expect(response.body.data.bioKetua).toBe(
        'Aktif dalam dakwah dan pembinaan jamaah.',
      );
      expect(response.body.data.fotoKetua).toContain('test-photo.jpg');
      expect(response.body.data.sampulMajelis).toContain('test-photo.jpg');
      expect(response.body.data.videoProfil).toBe(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/majelis-lembaga (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/majelis-lembaga')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/majelis-lembaga/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/majelis-lembaga/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('GET /api/v1/majelis-lembaga/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/majelis-lembaga/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/majelis-lembaga/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/majelis-lembaga/${createdId}`)
        .field('nama', 'Majelis Tarjih')
        .field('deskripsi', 'Deskripsi majelis yang sudah diperbarui.')
        .attach(
          'fotoKetua',
          Buffer.from('fake-updated-chairperson-image'),
          'ketua-baru.jpg',
        )
        .attach(
          'sampulMajelis',
          Buffer.from('fake-updated-cover-image'),
          'sampul-baru.jpg',
        )
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.nama).toBe('Majelis Tarjih');
      expect(response.body.data.slug).toBe('majelis-tarjih');
      expect(response.body.data.deskripsi).toBe(
        'Deskripsi majelis yang sudah diperbarui.',
      );
      expect(response.body.data.fotoKetua).toContain('test-photo.jpg');
      expect(response.body.data.sampulMajelis).toContain('test-photo.jpg');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/majelis-lembaga/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/majelis-lembaga/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/majelis-lembaga/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/majelis-lembaga/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/majelis-lembaga/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/majelis-lembaga/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.majelisLembaga.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'MajelisLembaga',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ProfilSejarah (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/profil-sejarah (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profil-sejarah')
        .field('konten', 'Sejarah PCA Kartasura awal mula berdiri...')
        .attach('foto', Buffer.from('fake-image'), 'test.jpg');

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.konten).toBe(
        'Sejarah PCA Kartasura awal mula berdiri...',
      );
      expect(response.body.data.foto).toContain('test-photo.jpg');

      createdId = response.body.data.id;
    });

    it('GET /api/v1/profil-sejarah (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/profil-sejarah')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/profil-sejarah/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-sejarah/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
    });

    it('PATCH /api/v1/profil-sejarah/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/profil-sejarah/${createdId}`)
        .field('konten', 'Update sejarah PCA Kartasura...');

      expect(response.status).toBe(200);
      expect(response.body.data.konten).toBe('Update sejarah PCA Kartasura...');
    });

    it('GET /api/v1/profil-sejarah/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-sejarah/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      // Minimal ada 2 logs: CREATE dan UPDATE
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/profil-sejarah/:id (Remove)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/profil-sejarah/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/profil-sejarah/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.profilSejarah.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ProfilSejarah',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ProfilVisiMisi (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/profil-visi-misi (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profil-visi-misi')
        .send({
          visi: 'Menjadi organisasi perempuan Islam yang unggul.',
          misi: 'Menguatkan dakwah, pendidikan, sosial, dan pemberdayaan umat.',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.visi).toBe(
        'Menjadi organisasi perempuan Islam yang unggul.',
      );
      expect(response.body.data.misi).toBe(
        'Menguatkan dakwah, pendidikan, sosial, dan pemberdayaan umat.',
      );

      createdId = response.body.data.id;
    });

    it('GET /api/v1/profil-visi-misi (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/profil-visi-misi')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/profil-visi-misi/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-visi-misi/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
    });

    it('PATCH /api/v1/profil-visi-misi/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/profil-visi-misi/${createdId}`)
        .send({
          visi: 'Terwujudnya perempuan Islam berkemajuan.',
        })
        .expect(200);

      expect(response.body.data.visi).toBe(
        'Terwujudnya perempuan Islam berkemajuan.',
      );
      expect(response.body.data.misi).toBe(
        'Menguatkan dakwah, pendidikan, sosial, dan pemberdayaan umat.',
      );
    });

    it('GET /api/v1/profil-visi-misi/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-visi-misi/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/profil-visi-misi/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/profil-visi-misi/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/profil-visi-misi/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.profilVisiMisi.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ProfilVisiMisi',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ProfilStrukturOrganisasi (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/profil-struktur-organisasi (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profil-struktur-organisasi')
        .attach('foto', Buffer.from('fake-structure-image'), 'struktur.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.foto).toContain('test-photo.jpg');

      createdId = response.body.data.id;
    });

    it('GET /api/v1/profil-struktur-organisasi (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/profil-struktur-organisasi')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/profil-struktur-organisasi/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-struktur-organisasi/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.foto).toContain('test-photo.jpg');
    });

    it('PATCH /api/v1/profil-struktur-organisasi/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/profil-struktur-organisasi/${createdId}`)
        .attach('foto', Buffer.from('fake-updated-structure-image'), 'struktur-baru.jpg')
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.foto).toContain('test-photo.jpg');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );
    });

    it('GET /api/v1/profil-struktur-organisasi/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/profil-struktur-organisasi/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/profil-struktur-organisasi/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/profil-struktur-organisasi/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/profil-struktur-organisasi/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.profilStrukturOrganisasi.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ProfilStrukturOrganisasi',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });
});
