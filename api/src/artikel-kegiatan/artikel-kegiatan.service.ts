import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateArtikelKegiatanDto } from './dto/create-artikel-kegiatan.dto';
import { FindArtikelKegiatanQueryDto } from './dto/find-artikel-kegiatan-query.dto';
import { UpdateArtikelKegiatanDto } from './dto/update-artikel-kegiatan.dto';

@Injectable()
export class ArtikelKegiatanService {
  private readonly entityName = 'ArtikelKegiatan';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateArtikelKegiatanDto) {
    await this.ensureMajelisLembagaExists(dto.majelisLembagaId);

    const slug = await this.generateUniqueSlug(dto.judul);
    const data = await this.prisma.artikelKegiatan.create({
      data: {
        slug,
        judul: dto.judul,
        tanggal: new Date(dto.tanggal),
        penulis: dto.penulis,
        deskripsi: dto.deskripsi,
        sampul: dto.sampul!,
        majelisLembagaId: dto.majelisLembagaId,
      },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: FindArtikelKegiatanQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = {
      deletedAt: null,
      ...(query.majelisLembagaId
        ? { majelisLembagaId: query.majelisLembagaId }
        : {}),
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.artikelKegiatan.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.artikelKegiatan.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.artikelKegiatan.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Artikel kegiatan dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.artikelKegiatan.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Artikel kegiatan dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateArtikelKegiatanDto) {
    const existing = await this.findOne(id);

    if (dto.majelisLembagaId) {
      await this.ensureMajelisLembagaExists(dto.majelisLembagaId);
    }

    const data = await this.prisma.artikelKegiatan.update({
      where: { id },
      data: {
        ...(dto.judul
          ? {
              judul: dto.judul,
              slug: await this.generateUniqueSlug(dto.judul, id),
            }
          : {}),
        ...(dto.tanggal ? { tanggal: new Date(dto.tanggal) } : {}),
        ...(dto.penulis ? { penulis: dto.penulis } : {}),
        ...(dto.deskripsi ? { deskripsi: dto.deskripsi } : {}),
        ...(dto.sampul ? { sampul: dto.sampul } : {}),
        ...(dto.majelisLembagaId
          ? { majelisLembagaId: dto.majelisLembagaId }
          : {}),
      },
    });

    await this.auditService.logChange(this.entityName, id, 'UPDATE', {
      before: existing,
      after: data,
    });

    return data;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const data = await this.prisma.artikelKegiatan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.logChange(this.entityName, id, 'DELETE', {
      before: existing,
      after: data,
    });

    return { success: true };
  }

  async getHistory(id: number) {
    return this.prisma.auditLog.findMany({
      where: {
        entityName: this.entityName,
        entityId: id,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureMajelisLembagaExists(id: number) {
    const data = await this.prisma.majelisLembaga.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Majelis/Lembaga dengan ID ${id} tidak ditemukan`,
      );
    }
  }

  private async generateUniqueSlug(judul: string, excludeId?: number) {
    const baseSlug = slugify(judul);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.artikelKegiatan.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }
}
