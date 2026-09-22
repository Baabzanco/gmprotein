import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { logger } from "../utils/logger";

interface CreateAuditLogDTO {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

let inMemoryAuditLogs: any[] = [];

export class AuditRepository {
  async log(data: CreateAuditLogDTO): Promise<void> {
    logger.info(`[AUDIT] Action: ${data.action} | Entity: ${data.entity} (ID: ${data.entityId || "N/A"}) by User: ${data.userId || "Anonymous"}`);

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.auditLog.create({
          data: {
            userId: data.userId,
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            metadata: data.metadata,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          },
        });
        return;
      } catch (err) {
        // Fallback
      }
    }

    inMemoryAuditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random()}`,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  async findAll(params?: { entity?: string; limit?: number }) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = {};
        if (params?.entity) where.entity = params.entity;

        const list = await prisma.auditLog.findMany({
          where,
          take: params?.limit || 50,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { email: true, firstName: true, lastName: true } } },
        });
        return list;
      } catch (err) {}
    }

    let logs = inMemoryAuditLogs;
    if (params?.entity) logs = logs.filter((l) => l.entity === params.entity);
    return logs.slice(0, params?.limit || 50);
  }
}

export const auditRepository = new AuditRepository();
