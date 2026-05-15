import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProfilSejarahDto } from './dto/create-profil-sejarah.dto';
import { UpdateProfilSejarahDto } from './dto/update-profil-sejarah.dto';

@Injectable()
export class ProfilSejarahService {
  private readonly entityName = 'ProfilSejarah';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProfilSejarahDto) {
    const data = await this.prisma.profilSejarah.create({
      data: dto,
    });
    
    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll() {
    return this.prisma.profilSejarah.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const data = await this.prisma.profilSejarah.findFirst({
      where: { id, deletedAt: null },
    });
    
    if (!data) {
      throw new NotFoundException(`Profil/Sejarah dengan ID ${id} tidak ditemukan`);
    }
    return data;
  }

  async update(id: number, dto: UpdateProfilSejarahDto) {
    const existing = await this.findOne(id);
    
    const data = await this.prisma.profilSejarah.update({
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

    const data = await this.prisma.profilSejarah.update({
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
