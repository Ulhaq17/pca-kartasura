import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logChange(
    entityName: string,
    entityId: number,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    changes: any = null,
  ) {
    return this.prisma.auditLog.create({
      data: {
        entityName,
        entityId,
        action,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
      },
    });
  }
}
