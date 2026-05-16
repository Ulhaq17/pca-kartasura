import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../shared/pagination/paginated-result';
import { CreatePeranDto } from './dto/create-peran.dto';
import { UpdatePeranDto } from './dto/update-peran.dto';

@Injectable()
export class PeranService {
  private readonly entityName = 'Peran';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreatePeranDto) {
    const data = await this.createPeran(dto);

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.peran.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.peran.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.peran.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`Peran dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async update(id: number, dto: UpdatePeranDto) {
    const existing = await this.findOne(id);
    const data = await this.updatePeran(id, dto);

    await this.auditService.logChange(this.entityName, id, 'UPDATE', {
      before: existing,
      after: data,
    });

    return data;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const anggotaCount = await this.prisma.anggota.count({
      where: { peranId: id, deletedAt: null },
    });

    if (anggotaCount > 0) {
      throw new ConflictException(
        'Peran tidak dapat dihapus karena masih digunakan oleh anggota',
      );
    }

    const data = await this.prisma.peran.update({
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

  private async createPeran(dto: CreatePeranDto) {
    try {
      return await this.prisma.peran.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async updatePeran(id: number, dto: UpdatePeranDto) {
    try {
      return await this.prisma.peran.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Nama peran sudah digunakan');
      }
    }

    throw error;
  }
}
