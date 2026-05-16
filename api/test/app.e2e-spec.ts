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
    uploadBuffer: jest
      .fn()
      .mockResolvedValue('http://localhost:9000/pca-bucket/test-thumbnail.jpg'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };

  const testImageBuffer = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#2563eb"/></svg>',
  );

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
    await prisma.buku.deleteMany();
    await prisma.bulletin.deleteMany();
    await prisma.pengumuman.deleteMany();
    await prisma.agenda.deleteMany();
    await prisma.anggota.deleteMany();
    await prisma.peran.deleteMany();
    await prisma.artikelKajian.deleteMany();
    await prisma.artikelKegiatan.deleteMany();
    await prisma.kegiatan.deleteMany();
    await prisma.programKerja.deleteMany();
    await prisma.majelisLembaga.deleteMany();
    await prisma.profilSejarah.deleteMany();
    await prisma.profilStrukturOrganisasi.deleteMany();
    await prisma.profilVisiMisi.deleteMany();
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health/live (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/live')
        .expect(200);
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
        .attach('sampulMajelis', Buffer.from('fake-cover-image'), 'sampul.jpg')
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
      expect(
        response.body.data.map((log: { action: string }) => log.action),
      ).toEqual(expect.arrayContaining(['CREATE', 'UPDATE']));
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

  describe('Peran dan Anggota (e2e)', () => {
    const uniqueSuffix = Date.now();
    const email = `anggota-${uniqueSuffix}@example.com`;
    let peranId: number;
    let majelisLembagaId: number;
    let anggotaId: number;

    beforeAll(async () => {
      const majelis = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', `Majelis Anggota ${uniqueSuffix}`)
        .field('deskripsi', 'Majelis untuk pengujian anggota.')
        .field('namaKetua', 'Nur Aisyah')
        .field('bioKetua', 'Aktif dalam pembinaan anggota.')
        .expect(201);

      majelisLembagaId = majelis.body.data.id;
    });

    it('POST /api/v1/peran (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/peran')
        .send({
          nama: `Sekretaris ${uniqueSuffix}`,
          keterangan: 'Mengelola administrasi organisasi.',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nama).toBe(`Sekretaris ${uniqueSuffix}`);
      expect(response.body.data.keterangan).toBe(
        'Mengelola administrasi organisasi.',
      );

      peranId = response.body.data.id;
    });

    it('GET /api/v1/peran (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/peran')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('PATCH /api/v1/peran/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/peran/${peranId}`)
        .send({ keterangan: 'Mengelola administrasi dan notulensi.' })
        .expect(200);

      expect(response.body.data.id).toBe(peranId);
      expect(response.body.data.keterangan).toBe(
        'Mengelola administrasi dan notulensi.',
      );
    });

    it('POST /api/v1/anggota (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/anggota')
        .send({
          nama: 'Aulia Rahma',
          email,
          peranId,
          majelisLembagaId,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nama).toBe('Aulia Rahma');
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.peran.id).toBe(peranId);
      expect(response.body.data.majelisLembaga.id).toBe(majelisLembagaId);

      anggotaId = response.body.data.id;
    });

    it('POST /api/v1/anggota (Duplicate Email)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/anggota')
        .send({
          nama: 'Anggota Duplikat',
          email,
          peranId,
          majelisLembagaId,
        })
        .expect(409);
    });

    it('GET /api/v1/anggota (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/anggota')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('peran');
      expect(response.body.data[0]).toHaveProperty('majelisLembaga');
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/anggota/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/anggota/${anggotaId}`)
        .expect(200);

      expect(response.body.data.id).toBe(anggotaId);
      expect(response.body.data.peran.id).toBe(peranId);
      expect(response.body.data.majelisLembaga.id).toBe(majelisLembagaId);
    });

    it('PATCH /api/v1/anggota/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/anggota/${anggotaId}`)
        .send({ nama: 'Aulia Rahma Putri' })
        .expect(200);

      expect(response.body.data.id).toBe(anggotaId);
      expect(response.body.data.nama).toBe('Aulia Rahma Putri');
    });

    it('GET /api/v1/anggota/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/anggota/${anggotaId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/peran/:id (Reject In Use)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/peran/${peranId}`)
        .expect(409);

      expect(response.body.message).toBe(
        'Peran tidak dapat dihapus karena masih digunakan oleh anggota',
      );

      const existingRecord = await prisma.peran.findUnique({
        where: { id: peranId },
      });
      expect(existingRecord).not.toBeNull();
      expect(existingRecord?.deletedAt).toBeNull();
    });

    it('DELETE /api/v1/anggota/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/anggota/${anggotaId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/anggota/${anggotaId}`)
        .expect(404);

      const deletedRecord = await prisma.anggota.findUnique({
        where: { id: anggotaId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);
    });

    it('GET /api/v1/peran/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/peran/${peranId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/peran/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/peran/${peranId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/peran/${peranId}`)
        .expect(404);

      const deletedRecord = await prisma.peran.findUnique({
        where: { id: peranId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Agenda (e2e)', () => {
    let majelisId: number;
    let createdId: number;
    let createdSlug: string;

    beforeAll(async () => {
      const majelis = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', 'Majelis Agenda')
        .field('deskripsi', 'Mengelola agenda organisasi.')
        .field('namaKetua', 'Khadijah')
        .field('bioKetua', 'Aktif dalam koordinasi agenda.')
        .expect(201);

      majelisId = majelis.body.data.id;
    });

    it('POST /api/v1/agenda (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/agenda')
        .send({
          judul: 'Rapat Koordinasi Majelis',
          deskripsi: 'Agenda koordinasi lintas bidang majelis.',
          tanggal: '2026-06-10',
          waktuMulai: '2026-06-10T08:00:00.000Z',
          waktuSelesai: '2026-06-10T10:00:00.000Z',
          tempat: 'Aula PCA Kartasura',
          majelisId,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe('rapat-koordinasi-majelis');
      expect(response.body.data.judul).toBe('Rapat Koordinasi Majelis');
      expect(response.body.data.tempat).toBe('Aula PCA Kartasura');
      expect(response.body.data.majelisId).toBe(majelisId);
      expect(response.body.data.majelisLembaga.id).toBe(majelisId);

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/agenda (Find All with Filters)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/agenda')
        .query({
          page: 1,
          limit: 10,
          majelisId,
          startDate: '2026-06-01',
          endDate: '2026-06-30',
        })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].majelisId).toBe(majelisId);
      expect(response.body.data[0].tanggal).toContain('2026-06-10');
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/agenda/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/agenda/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
      expect(response.body.data.majelisLembaga.id).toBe(majelisId);
    });

    it('GET /api/v1/agenda/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/agenda/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/agenda/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/agenda/${createdId}`)
        .send({
          judul: 'Rapat Koordinasi Bulanan Majelis',
          tempat: 'Ruang Pertemuan PCA Kartasura',
        })
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.judul).toBe('Rapat Koordinasi Bulanan Majelis');
      expect(response.body.data.slug).toBe('rapat-koordinasi-bulanan-majelis');
      expect(response.body.data.tempat).toBe('Ruang Pertemuan PCA Kartasura');

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/agenda/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/agenda/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/agenda/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/agenda/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/agenda/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/agenda/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.agenda.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Pengumuman (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/pengumuman (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/pengumuman')
        .field('judul', 'Pendaftaran Kajian Ramadhan')
        .field('tanggal', '2026-05-20T08:00:00.000Z')
        .attach('file', testImageBuffer, {
          filename: 'pengumuman.svg',
          contentType: 'image/svg+xml',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.judul).toBe('Pendaftaran Kajian Ramadhan');
      expect(response.body.data.tanggal).toBe('2026-05-20T08:00:00.000Z');
      expect(response.body.data.file).toContain('test-photo.jpg');
      expect(response.body.data.thumbnail).toContain('test-thumbnail.jpg');
      expect(mockStorageService.uploadBuffer).toHaveBeenCalled();

      createdId = response.body.data.id;
    });

    it('GET /api/v1/pengumuman (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/pengumuman')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/pengumuman/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/pengumuman/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
    });

    it('PATCH /api/v1/pengumuman/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/pengumuman/${createdId}`)
        .field('judul', 'Pendaftaran Kajian Ramadhan Diperpanjang')
        .attach('file', testImageBuffer, {
          filename: 'pengumuman-baru.svg',
          contentType: 'image/svg+xml',
        })
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.judul).toBe(
        'Pendaftaran Kajian Ramadhan Diperpanjang',
      );
      expect(response.body.data.thumbnail).toBe(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
    });

    it('GET /api/v1/pengumuman/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/pengumuman/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/pengumuman/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/pengumuman/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/pengumuman/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.pengumuman.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'Pengumuman',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('Bulletin (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/bulletin (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/bulletin')
        .field('judul', 'Bulletin PCA Kartasura Edisi Mei')
        .field('tanggal', '2026-05-25T08:00:00.000Z')
        .attach('file', testImageBuffer, {
          filename: 'bulletin.svg',
          contentType: 'image/svg+xml',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.judul).toBe('Bulletin PCA Kartasura Edisi Mei');
      expect(response.body.data.tanggal).toBe('2026-05-25T08:00:00.000Z');
      expect(response.body.data.file).toContain('test-photo.jpg');
      expect(response.body.data.thumbnail).toContain('test-thumbnail.jpg');
      expect(mockStorageService.uploadBuffer).toHaveBeenCalled();

      createdId = response.body.data.id;
    });

    it('GET /api/v1/bulletin (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/bulletin')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/bulletin/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/bulletin/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
    });

    it('PATCH /api/v1/bulletin/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/bulletin/${createdId}`)
        .field('judul', 'Bulletin PCA Kartasura Edisi Mei Revisi')
        .attach('file', testImageBuffer, {
          filename: 'bulletin-baru.svg',
          contentType: 'image/svg+xml',
        })
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.judul).toBe(
        'Bulletin PCA Kartasura Edisi Mei Revisi',
      );
      expect(response.body.data.thumbnail).toBe(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
    });

    it('GET /api/v1/bulletin/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/bulletin/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/bulletin/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/bulletin/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/bulletin/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.bulletin.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'Bulletin',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('Buku (e2e)', () => {
    let createdId: number;

    it('POST /api/v1/buku (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/buku')
        .field('judul', 'Buku Panduan Aisyiyah')
        .field('penulis', 'Tim PCA Kartasura')
        .field('tanggal', '2026-05-28T08:00:00.000Z')
        .attach('file', testImageBuffer, {
          filename: 'buku.svg',
          contentType: 'image/svg+xml',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.judul).toBe('Buku Panduan Aisyiyah');
      expect(response.body.data.penulis).toBe('Tim PCA Kartasura');
      expect(response.body.data.tanggal).toBe('2026-05-28T08:00:00.000Z');
      expect(response.body.data.file).toContain('test-photo.jpg');
      expect(response.body.data.thumbnail).toContain('test-thumbnail.jpg');
      expect(mockStorageService.uploadBuffer).toHaveBeenCalled();

      createdId = response.body.data.id;
    });

    it('GET /api/v1/buku (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/buku')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/buku/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/buku/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
    });

    it('PATCH /api/v1/buku/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/buku/${createdId}`)
        .field('judul', 'Buku Panduan Aisyiyah Revisi')
        .field('penulis', 'Tim Majelis Pendidikan')
        .attach('file', testImageBuffer, {
          filename: 'buku-baru.svg',
          contentType: 'image/svg+xml',
        })
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.judul).toBe('Buku Panduan Aisyiyah Revisi');
      expect(response.body.data.penulis).toBe('Tim Majelis Pendidikan');
      expect(response.body.data.thumbnail).toBe(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-thumbnail.jpg',
      );
    });

    it('GET /api/v1/buku/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/buku/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/buku/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/buku/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/buku/${createdId}`)
        .expect(404);

      const deletedRecord = await prisma.buku.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'Buku',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ProgramKerja (e2e)', () => {
    let majelisLembagaId: number;
    let createdId: number;
    let createdSlug: string;

    beforeAll(async () => {
      const majelis = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', 'Majelis Pendidikan')
        .field('deskripsi', 'Mengelola program pendidikan.')
        .field('namaKetua', 'Fatimah')
        .field('bioKetua', 'Aktif dalam pengembangan pendidikan.')
        .expect(201);

      majelisLembagaId = majelis.body.data.id;
    });

    it('POST /api/v1/program-kerja (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/program-kerja')
        .field('judul', 'Penguatan Literasi Keluarga')
        .field('majelisLembagaId', String(majelisLembagaId))
        .field('deskripsi', 'Program pendampingan literasi untuk keluarga.')
        .attach('foto', Buffer.from('fake-program-image'), 'program.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe('penguatan-literasi-keluarga');
      expect(response.body.data.judul).toBe('Penguatan Literasi Keluarga');
      expect(response.body.data.foto).toContain('test-photo.jpg');
      expect(response.body.data.majelisLembaga.id).toBe(majelisLembagaId);

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/program-kerja (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/program-kerja')
        .query({ page: 1, limit: 10, majelisLembagaId })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/program-kerja/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/program-kerja/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('GET /api/v1/program-kerja/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/program-kerja/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/program-kerja/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/program-kerja/${createdId}`)
        .field('judul', 'Literasi Keluarga Berkemajuan')
        .field('deskripsi', 'Deskripsi program yang sudah diperbarui.')
        .attach(
          'foto',
          Buffer.from('fake-updated-program-image'),
          'program-baru.jpg',
        )
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe('literasi-keluarga-berkemajuan');
      expect(response.body.data.deskripsi).toBe(
        'Deskripsi program yang sudah diperbarui.',
      );
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/program-kerja/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/program-kerja/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/program-kerja/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/program-kerja/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/program-kerja/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/program-kerja/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.programKerja.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ProgramKerja',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('Kegiatan (e2e)', () => {
    let programKerjaId: number;
    let createdId: number;
    let createdSlug: string;

    beforeAll(async () => {
      const majelis = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', 'Majelis Kesehatan')
        .field('deskripsi', 'Mengelola program kesehatan.')
        .field('namaKetua', 'Aisyah')
        .field('bioKetua', 'Aktif dalam layanan kesehatan masyarakat.')
        .expect(201);

      const program = await request(app.getHttpServer())
        .post('/api/v1/program-kerja')
        .field('judul', 'Posyandu Berkemajuan')
        .field('majelisLembagaId', String(majelis.body.data.id))
        .field('deskripsi', 'Program layanan kesehatan keluarga.')
        .attach(
          'foto',
          Buffer.from('fake-health-program-image'),
          'posyandu.jpg',
        )
        .expect(201);

      programKerjaId = program.body.data.id;
    });

    it('POST /api/v1/kegiatan (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/kegiatan')
        .field('judul', 'Pemeriksaan Kesehatan Ibu dan Anak')
        .field('deskripsi', 'Kegiatan pemeriksaan kesehatan rutin.')
        .field('tanggal', '2026-05-15T09:00:00.000Z')
        .field('programKerjaId', String(programKerjaId))
        .attach('foto', Buffer.from('fake-activity-image-1'), 'kegiatan-1.jpg')
        .attach('foto', Buffer.from('fake-activity-image-2'), 'kegiatan-2.jpg')
        .attach('foto', Buffer.from('fake-activity-image-3'), 'kegiatan-3.jpg')
        .attach('foto', Buffer.from('fake-activity-image-4'), 'kegiatan-4.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe(
        'pemeriksaan-kesehatan-ibu-dan-anak',
      );
      expect(response.body.data.judul).toBe(
        'Pemeriksaan Kesehatan Ibu dan Anak',
      );
      expect(response.body.data.foto).toHaveLength(4);
      expect(response.body.data.programKerja.id).toBe(programKerjaId);

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('POST /api/v1/kegiatan rejects more than 4 photos', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/kegiatan')
        .field('judul', 'Kegiatan Dengan Banyak Foto')
        .field('deskripsi', 'Harus ditolak karena lebih dari 4 foto.')
        .field('tanggal', '2026-05-15T09:00:00.000Z')
        .field('programKerjaId', String(programKerjaId))
        .attach('foto', Buffer.from('fake-activity-image-1'), 'lebih-1.jpg')
        .attach('foto', Buffer.from('fake-activity-image-2'), 'lebih-2.jpg')
        .attach('foto', Buffer.from('fake-activity-image-3'), 'lebih-3.jpg')
        .attach('foto', Buffer.from('fake-activity-image-4'), 'lebih-4.jpg')
        .attach('foto', Buffer.from('fake-activity-image-5'), 'lebih-5.jpg')
        .expect(400);
    });

    it('GET /api/v1/kegiatan (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/kegiatan')
        .query({ page: 1, limit: 10, programKerjaId })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/kegiatan/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/kegiatan/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('GET /api/v1/kegiatan/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/kegiatan/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/kegiatan/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/kegiatan/${createdId}`)
        .field('judul', 'Pemeriksaan Kesehatan Rutin')
        .field('deskripsi', 'Kegiatan kesehatan yang sudah diperbarui.')
        .field('programKerjaId', String(programKerjaId))
        .attach(
          'foto',
          Buffer.from('fake-updated-activity-image'),
          'kegiatan-baru.jpg',
        )
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe('pemeriksaan-kesehatan-rutin');
      expect(response.body.data.foto).toHaveLength(1);
      expect(response.body.data.deskripsi).toBe(
        'Kegiatan kesehatan yang sudah diperbarui.',
      );

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/kegiatan/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/kegiatan/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/kegiatan/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/kegiatan/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/kegiatan/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/kegiatan/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.kegiatan.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'Kegiatan',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ArtikelKegiatan (e2e)', () => {
    let majelisLembagaId: number;
    let createdId: number;
    let createdSlug: string;

    beforeAll(async () => {
      const majelis = await request(app.getHttpServer())
        .post('/api/v1/majelis-lembaga')
        .field('nama', 'Majelis Sosial')
        .field('deskripsi', 'Mengelola program sosial kemasyarakatan.')
        .field('namaKetua', 'Khadijah')
        .field('bioKetua', 'Aktif dalam gerakan sosial masyarakat.')
        .expect(201);

      majelisLembagaId = majelis.body.data.id;
    });

    it('POST /api/v1/artikel-kegiatan (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/artikel-kegiatan')
        .field('judul', 'Bakti Sosial Ramadhan')
        .field('tanggal', '2026-05-15T09:00:00.000Z')
        .field('penulis', 'Admin PCA Kartasura')
        .field('deskripsi', 'Artikel kegiatan bakti sosial ramadhan.')
        .field('majelisLembagaId', String(majelisLembagaId))
        .attach('sampul', Buffer.from('fake-article-cover'), 'artikel.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe('bakti-sosial-ramadhan');
      expect(response.body.data.judul).toBe('Bakti Sosial Ramadhan');
      expect(response.body.data.penulis).toBe('Admin PCA Kartasura');
      expect(response.body.data.sampul).toContain('test-photo.jpg');
      expect(response.body.data.majelisLembagaId).toBe(majelisLembagaId);
      expect(response.body.data.majelisLembaga).toBeUndefined();

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/artikel-kegiatan (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/artikel-kegiatan')
        .query({ page: 1, limit: 10, majelisLembagaId })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].majelisLembaga).toBeUndefined();
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/artikel-kegiatan/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kegiatan/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
      expect(response.body.data.majelisLembaga).toBeUndefined();
    });

    it('GET /api/v1/artikel-kegiatan/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kegiatan/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/artikel-kegiatan/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/artikel-kegiatan/${createdId}`)
        .field('judul', 'Bakti Sosial Ramadhan Berkemajuan')
        .field('deskripsi', 'Artikel kegiatan yang sudah diperbarui.')
        .attach(
          'sampul',
          Buffer.from('fake-updated-article-cover'),
          'artikel-baru.jpg',
        )
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe('bakti-sosial-ramadhan-berkemajuan');
      expect(response.body.data.deskripsi).toBe(
        'Artikel kegiatan yang sudah diperbarui.',
      );
      expect(response.body.data.sampul).toContain('test-photo.jpg');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/artikel-kegiatan/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kegiatan/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/artikel-kegiatan/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/artikel-kegiatan/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/artikel-kegiatan/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/artikel-kegiatan/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.artikelKegiatan.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ArtikelKegiatan',
          entityId: createdId,
          action: 'DELETE',
        },
      });
      expect(deleteLog).not.toBeNull();
    });
  });

  describe('ArtikelKajian (e2e)', () => {
    let createdId: number;
    let createdSlug: string;

    it('POST /api/v1/artikel-kajian (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/artikel-kajian')
        .field('judul', 'Kajian Tafsir Surat Al-Fatihah')
        .field('tanggal', '2026-05-15T09:00:00.000Z')
        .field('penulis', 'Admin PCA Kartasura')
        .field('deskripsi', 'Artikel kajian tafsir surat Al-Fatihah.')
        .attach('sampul', Buffer.from('fake-kajian-cover'), 'kajian.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.slug).toBe('kajian-tafsir-surat-al-fatihah');
      expect(response.body.data.judul).toBe('Kajian Tafsir Surat Al-Fatihah');
      expect(response.body.data.penulis).toBe('Admin PCA Kartasura');
      expect(response.body.data.sampul).toContain('test-photo.jpg');

      createdId = response.body.data.id;
      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/artikel-kajian (Find All)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/artikel-kajian')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expectPaginationMeta(response.body);
    });

    it('GET /api/v1/artikel-kajian/:id (Find One)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kajian/${createdId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('GET /api/v1/artikel-kajian/slug/:slug (Find By Slug)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kajian/slug/${createdSlug}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(createdSlug);
    });

    it('PATCH /api/v1/artikel-kajian/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/artikel-kajian/${createdId}`)
        .field('judul', 'Kajian Tafsir Surat Al-Fatihah Berkemajuan')
        .field('deskripsi', 'Artikel kajian yang sudah diperbarui.')
        .attach(
          'sampul',
          Buffer.from('fake-updated-kajian-cover'),
          'kajian-baru.jpg',
        )
        .expect(200);

      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.slug).toBe(
        'kajian-tafsir-surat-al-fatihah-berkemajuan',
      );
      expect(response.body.data.deskripsi).toBe(
        'Artikel kajian yang sudah diperbarui.',
      );
      expect(response.body.data.sampul).toContain('test-photo.jpg');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'http://localhost:9000/pca-bucket/test-photo.jpg',
      );

      createdSlug = response.body.data.slug;
    });

    it('GET /api/v1/artikel-kajian/:id/history (Audit Logs)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/artikel-kajian/${createdId}/history`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0].action).toBe('UPDATE');
      expect(response.body.data[1].action).toBe('CREATE');
    });

    it('DELETE /api/v1/artikel-kajian/:id (Soft Delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/artikel-kajian/${createdId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/artikel-kajian/${createdId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/artikel-kajian/slug/${createdSlug}`)
        .expect(404);

      const deletedRecord = await prisma.artikelKajian.findUnique({
        where: { id: createdId },
      });
      expect(deletedRecord).not.toBeNull();
      expect(deletedRecord?.deletedAt).toBeInstanceOf(Date);

      const deleteLog = await prisma.auditLog.findFirst({
        where: {
          entityName: 'ArtikelKajian',
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
        .attach(
          'foto',
          Buffer.from('fake-updated-structure-image'),
          'struktur-baru.jpg',
        )
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
