import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { UpdateBulletinDto } from './dto/update-bulletin.dto';

@Injectable()
export class BulletinService {
  private readonly entityName = 'Bulletin';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateBulletinDto, file: string, thumbnail: string) {
    const data = await this.prisma.bulletin.create({
      data: {
        judul: dto.judul,
        tanggal: new Date(dto.tanggal),
        file,
        thumbnail,
      },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.bulletin.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.bulletin.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.bulletin.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`Bulletin dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async update(
    id: number,
    dto: UpdateBulletinDto,
    file?: string,
    thumbnail?: string,
  ) {
    const existing = await this.findOne(id);
    const data = await this.prisma.bulletin.update({
      where: { id },
      data: {
        ...(dto.judul ? { judul: dto.judul } : {}),
        ...(dto.tanggal ? { tanggal: new Date(dto.tanggal) } : {}),
        ...(file ? { file } : {}),
        ...(thumbnail ? { thumbnail } : {}),
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
    const data = await this.prisma.bulletin.update({
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
