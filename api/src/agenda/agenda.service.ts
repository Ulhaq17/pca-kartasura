import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { FindAgendaQueryDto } from './dto/find-agenda-query.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendaService {
  private readonly entityName = 'Agenda';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateAgendaDto) {
    await this.ensureMajelisLembagaExists(dto.majelisId);

    const slug = await this.generateUniqueSlug(dto.judul);
    const data = await this.prisma.agenda.create({
      data: {
        slug,
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        tanggal: new Date(dto.tanggal),
        waktuMulai: new Date(dto.waktuMulai),
        waktuSelesai: new Date(dto.waktuSelesai),
        tempat: dto.tempat,
        majelisId: dto.majelisId,
      },
      include: this.includeRelations(),
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: FindAgendaQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = {
      deletedAt: null,
      ...(query.majelisId ? { majelisId: query.majelisId } : {}),
      ...(query.startDate || query.endDate
        ? {
            tanggal: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.agenda.findMany({
        where,
        skip,
        take,
        orderBy: [{ tanggal: 'asc' }, { waktuMulai: 'asc' }],
        include: this.includeRelations(),
      }),
      this.prisma.agenda.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.agenda.findFirst({
      where: { id, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(`Agenda dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.agenda.findFirst({
      where: { slug, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(
        `Agenda dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateAgendaDto) {
    const existing = await this.findOne(id);

    if (dto.majelisId) {
      await this.ensureMajelisLembagaExists(dto.majelisId);
    }

    const data = await this.prisma.agenda.update({
      where: { id },
      data: {
        ...(dto.judul
          ? {
              judul: dto.judul,
              slug: await this.generateUniqueSlug(dto.judul, id),
            }
          : {}),
        ...(dto.deskripsi ? { deskripsi: dto.deskripsi } : {}),
        ...(dto.tanggal ? { tanggal: new Date(dto.tanggal) } : {}),
        ...(dto.waktuMulai ? { waktuMulai: new Date(dto.waktuMulai) } : {}),
        ...(dto.waktuSelesai
          ? { waktuSelesai: new Date(dto.waktuSelesai) }
          : {}),
        ...(dto.tempat ? { tempat: dto.tempat } : {}),
        ...(dto.majelisId ? { majelisId: dto.majelisId } : {}),
      },
      include: this.includeRelations(),
    });

    await this.auditService.logChange(this.entityName, id, 'UPDATE', {
      before: existing,
      after: data,
    });

    return data;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const data = await this.prisma.agenda.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.includeRelations(),
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

  private includeRelations() {
    return {
      majelisLembaga: true,
    };
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
      const existing = await this.prisma.agenda.findUnique({
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
