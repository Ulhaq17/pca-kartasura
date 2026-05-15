import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { slugify } from '../shared/utils/slugify.util';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { FindKegiatanQueryDto } from './dto/find-kegiatan-query.dto';
import { UpdateKegiatanDto } from './dto/update-kegiatan.dto';

@Injectable()
export class KegiatanService {
  private readonly entityName = 'Kegiatan';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateKegiatanDto) {
    await this.ensureProgramKerjaExists(dto.programKerjaId);
    const slug = await this.generateUniqueSlug(dto.judul);

    const data = await this.prisma.kegiatan.create({
      data: {
        slug,
        judul: dto.judul,
        foto: dto.foto ?? [],
        deskripsi: dto.deskripsi,
        tanggal: new Date(dto.tanggal),
        programKerjaId: dto.programKerjaId,
      },
      include: this.includeRelations(),
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: FindKegiatanQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = {
      deletedAt: null,
      ...(query.programKerjaId
        ? { programKerjaId: query.programKerjaId }
        : {}),
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.kegiatan.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: 'desc' },
        include: this.includeRelations(),
      }),
      this.prisma.kegiatan.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.kegiatan.findFirst({
      where: { id, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(`Kegiatan dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.kegiatan.findFirst({
      where: { slug, deletedAt: null },
      include: this.includeRelations(),
    });

    if (!data) {
      throw new NotFoundException(
        `Kegiatan dengan slug ${slug} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateKegiatanDto) {
    const existing = await this.findOne(id);
    if (dto.programKerjaId) {
      await this.ensureProgramKerjaExists(dto.programKerjaId);
    }

    const data = await this.prisma.kegiatan.update({
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
        ...(dto.foto ? { foto: dto.foto } : {}),
        ...(dto.programKerjaId ? { programKerjaId: dto.programKerjaId } : {}),
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
    const data = await this.prisma.kegiatan.update({
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
      programKerja: {
        include: {
          majelisLembaga: true,
        },
      },
    };
  }

  private async ensureProgramKerjaExists(id: number) {
    const activeProgramKerja = await this.prisma.programKerja.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!activeProgramKerja) {
      throw new NotFoundException(`Program kerja dengan ID ${id} tidak ditemukan`);
    }
  }

  private async generateUniqueSlug(judul: string, excludeId?: number) {
    const baseSlug = slugify(judul);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.kegiatan.findUnique({
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
