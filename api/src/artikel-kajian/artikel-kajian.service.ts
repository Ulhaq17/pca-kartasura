import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateArtikelKajianDto } from './dto/create-artikel-kajian.dto';
import { UpdateArtikelKajianDto } from './dto/update-artikel-kajian.dto';

@Injectable()
export class ArtikelKajianService {
  private readonly entityName = 'ArtikelKajian';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateArtikelKajianDto) {
    const slug = await this.generateUniqueSlug(dto.judul);
    const data = await this.prisma.artikelKajian.create({
      data: {
        slug,
        judul: dto.judul,
        tanggal: new Date(dto.tanggal),
        penulis: dto.penulis,
        deskripsi: dto.deskripsi,
        sampul: dto.sampul!,
      },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.artikelKajian.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.artikelKajian.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.artikelKajian.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Artikel kajian dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.artikelKajian.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Artikel kajian dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateArtikelKajianDto) {
    const existing = await this.findOne(id);
    const data = await this.prisma.artikelKajian.update({
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
    const data = await this.prisma.artikelKajian.update({
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

  private async generateUniqueSlug(judul: string, excludeId?: number) {
    const baseSlug = slugify(judul);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.artikelKajian.findUnique({
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
