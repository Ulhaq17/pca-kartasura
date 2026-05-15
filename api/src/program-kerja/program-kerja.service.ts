import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateProgramKerjaDto } from './dto/create-program-kerja.dto';
import { FindProgramKerjaQueryDto } from './dto/find-program-kerja-query.dto';
import { UpdateProgramKerjaDto } from './dto/update-program-kerja.dto';

@Injectable()
export class ProgramKerjaService {
  private readonly entityName = 'ProgramKerja';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProgramKerjaDto) {
    await this.ensureMajelisLembagaExists(dto.majelisLembagaId);

    const slug = await this.generateUniqueSlug(dto.judul);
    const data = await this.prisma.programKerja.create({
      data: {
        slug,
        judul: dto.judul,
        majelisLembagaId: dto.majelisLembagaId,
        foto: dto.foto!,
        deskripsi: dto.deskripsi,
      },
      include: this.includeRelations(),
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: FindProgramKerjaQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = {
      deletedAt: null,
      ...(query.majelisLembagaId
        ? { majelisLembagaId: query.majelisLembagaId }
        : {}),
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.programKerja.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: this.includeRelations(),
      }),
      this.prisma.programKerja.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.programKerja.findFirst({
      where: { id, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(
        `Program kerja dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.programKerja.findFirst({
      where: { slug, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(
        `Program kerja dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateProgramKerjaDto) {
    const existing = await this.findOne(id);

    if (dto.majelisLembagaId) {
      await this.ensureMajelisLembagaExists(dto.majelisLembagaId);
    }

    const data = await this.prisma.programKerja.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.judul
          ? { slug: await this.generateUniqueSlug(dto.judul, id) }
          : {}),
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
    const data = await this.prisma.programKerja.update({
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
      const existing = await this.prisma.programKerja.findUnique({
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
