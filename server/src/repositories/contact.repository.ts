import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { ContactRequestDTO, ContactRequestStatus } from "../../../shared/types";

let inMemoryContactRequests: ContactRequestDTO[] = [];

export class ContactRepository {
  async create(data: {
    name: string;
    phone: string;
    company?: string | null;
    email?: string | null;
    subject: string;
    message: string;
  }): Promise<ContactRequestDTO> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.contactRequest.create({
          data: {
            name: data.name,
            phone: data.phone,
            company: data.company,
            email: data.email,
            subject: data.subject,
            message: data.message,
            status: "NEW",
          },
        });

        return {
          id: created.id,
          name: created.name,
          phone: created.phone,
          company: created.company,
          email: created.email,
          subject: created.subject,
          message: created.message,
          status: created.status as ContactRequestStatus,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    const item: ContactRequestDTO = {
      id: `contact-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      company: data.company,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    inMemoryContactRequests.unshift(item);
    return item;
  }

  async findAll(params?: { status?: string }): Promise<ContactRequestDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = {};
        if (params?.status) where.status = params.status;

        const list = await prisma.contactRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return list.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          company: c.company,
          email: c.email,
          subject: c.subject,
          message: c.message,
          status: c.status as ContactRequestStatus,
          createdAt: c.createdAt.toISOString(),
        }));
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryContactRequests;
  }

  async updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequestDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updated = await prisma.contactRequest.update({
          where: { id },
          data: { status: status as any },
        });
        return {
          id: updated.id,
          name: updated.name,
          phone: updated.phone,
          company: updated.company,
          email: updated.email,
          subject: updated.subject,
          message: updated.message,
          status: updated.status as ContactRequestStatus,
          createdAt: updated.createdAt.toISOString(),
        };
      } catch (err) {}
    }

    const item = inMemoryContactRequests.find((c) => c.id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  }
}

export const contactRepository = new ContactRepository();
