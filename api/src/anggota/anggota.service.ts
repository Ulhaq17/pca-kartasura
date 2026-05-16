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
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { UpdateAnggotaDto } from './dto/update-anggota.dto';

@Injectable()
export class AnggotaService {
  private readonly entityName = 'Anggota';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateAnggotaDto) {
    const data = await this.createAnggota(dto);

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = getPaginationParams(query);
    const where = { deletedAt: null };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.anggota.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude(),
      }),
      this.prisma.anggota.count({ where }),
    ]);

    return createPaginatedResult(items, totalItems, query);
  }

  async findOne(id: number) {
    const data = await this.prisma.anggota.findFirst({
      where: { id, deletedAt: null },
      include: this.defaultInclude(),
    });

    if (!data) {
      throw new NotFoundException(`Anggota dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async update(id: number, dto: UpdateAnggotaDto) {
    const existing = await this.findOne(id);
    const data = await this.updateAnggota(id, dto);

    await this.auditService.logChange(this.entityName, id, 'UPDATE', {
      before: existing,
      after: data,
    });

    return data;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const data = await this.prisma.anggota.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude(),
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

  private defaultInclude() {
    return {
      peran: true,
      majelisLembaga: true,
    };
  }

  private async createAnggota(dto: CreateAnggotaDto) {
    try {
      return await this.prisma.anggota.create({
        data: dto,
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async updateAnggota(id: number, dto: UpdateAnggotaDto) {
    try {
      return await this.prisma.anggota.update({
        where: { id },
        data: dto,
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email anggota sudah digunakan');
      }
    }

    throw error;
  }
}
