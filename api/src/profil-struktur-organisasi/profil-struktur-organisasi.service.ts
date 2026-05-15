import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilStrukturOrganisasiDto } from './dto/create-profil-struktur-organisasi.dto';
import { UpdateProfilStrukturOrganisasiDto } from './dto/update-profil-struktur-organisasi.dto';

@Injectable()
export class ProfilStrukturOrganisasiService {
  private readonly entityName = 'ProfilStrukturOrganisasi';

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProfilStrukturOrganisasiDto) {
    const data = await this.prisma.profilStrukturOrganisasi.create({
      data: { foto: dto.foto! },
    });

    await this.auditService.logChange(this.entityName, data.id, 'CREATE', data);
    return data;
  }

  async findAll() {
    return this.prisma.profilStrukturOrganisasi.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const data = await this.prisma.profilStrukturOrganisasi.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(
        `Profil Struktur Organisasi dengan ID ${id} tidak ditemukan`,
      );
    }

    return data;
  }

  async update(id: number, dto: UpdateProfilStrukturOrganisasiDto) {
    const existing = await this.findOne(id);

    const data = await this.prisma.profilStrukturOrganisasi.update({
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

    const data = await this.prisma.profilStrukturOrganisasi.update({
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
