import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { CreatePengumumanDto } from './dto/create-pengumuman.dto';
import { UpdatePengumumanDto } from './dto/update-pengumuman.dto';

@Injectable()
export class PengumumanService {
  private readonly entityName = 'Pengumuman';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreatePengumumanDto) {
    const data = await this.prisma.pengumuman.create({
      data: {
        judul: dto.judul,
        tanggal: new Date(dto.tanggal),
        file: dto.file,
        thumbnail: dto.thumbnail,
      },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.pengumuman.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.pengumuman.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.pengumuman.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`Pengumuman dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async update(id: number, dto: UpdatePengumumanDto) {
    const existing = await this.findOne(id);
    const data = await this.prisma.pengumuman.update({
      where: { id },
      data: {
        ...(dto.judul ? { judul: dto.judul } : {}),
        ...(dto.tanggal ? { tanggal: new Date(dto.tanggal) } : {}),
        ...(dto.file ? { file: dto.file } : {}),
        ...(dto.thumbnail ? { thumbnail: dto.thumbnail } : {}),
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
    const data = await this.prisma.pengumuman.update({
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
}
