import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateMajelisLembagaDto } from './dto/create-majelis-lembaga.dto';
import { UpdateMajelisLembagaDto } from './dto/update-majelis-lembaga.dto';

@Injectable()
export class MajelisLembagaService {
  private readonly entityName = 'MajelisLembaga';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateMajelisLembagaDto) {
    const slug = await this.generateUniqueSlug(dto.nama);
    const data = await this.prisma.majelisLembaga.create({
      data: { ...dto, slug },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.majelisLembaga.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.majelisLembaga.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.majelisLembaga.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Majelis/Lembaga dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.majelisLembaga.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Majelis/Lembaga dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateMajelisLembagaDto) {
    const existing = await this.findOne(id);
    const data = await this.prisma.majelisLembaga.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.nama
          ? { slug: await this.generateUniqueSlug(dto.nama, id) }
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
    const data = await this.prisma.majelisLembaga.update({
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

  private async generateUniqueSlug(nama: string, excludeId?: number) {
    const baseSlug = slugify(nama);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.majelisLembaga.findUnique({
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
