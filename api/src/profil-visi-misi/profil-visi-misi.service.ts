import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { CreateProfilVisiMisiDto } from './dto/create-profil-visi-misi.dto';
import { UpdateProfilVisiMisiDto } from './dto/update-profil-visi-misi.dto';

@Injectable()
export class ProfilVisiMisiService {
  private readonly entityName = 'ProfilVisiMisi';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProfilVisiMisiDto) {
    const data = await this.prisma.profilVisiMisi.create({
      data: dto,
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.profilVisiMisi.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.profilVisiMisi.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.profilVisiMisi.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Profil Visi Misi dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateProfilVisiMisiDto) {
    const existing = await this.findOne(id);

    const data = await this.prisma.profilVisiMisi.update({
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

    const data = await this.prisma.profilVisiMisi.update({
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
