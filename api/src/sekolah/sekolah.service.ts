import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { UpdateSekolahDto } from './dto/update-sekolah.dto';

@Injectable()
export class SekolahService {
  private readonly entityName = 'Sekolah';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateSekolahDto) {
    const data = await this.prisma.sekolah.create({
      data: {
        nama: dto.nama,
        foto: dto.foto!,
        deskripsi: dto.deskripsi,
        lokasi: dto.lokasi,
      },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.sekolah.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.sekolah.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.sekolah.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async update(id: number, dto: UpdateSekolahDto) {
    const existing = await this.findOne(id);
    const data = await this.prisma.sekolah.update({
      where: { id },
      data: dto,
    });

    await this.auditService.logChange(this.entityName, id, 'UPDATE', {
      before: existing,
      after: data,
    });

    return data;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const data = await this.prisma.sekolah.update({
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
