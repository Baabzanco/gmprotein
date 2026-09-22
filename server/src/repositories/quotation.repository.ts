import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { QuotationRequestDTO, QuotationStatus } from "../../../shared/types";
import { Decimal } from "@prisma/client/runtime/library";

let inMemoryQuotations: QuotationRequestDTO[] = [];

export class QuotationRepository {
  async create(data: {
    customerName: string;
    companyName?: string | null;
    phone: string;
    email?: string | null;
    notes?: string | null;
    items: {
      productId: string;
      requestedWeight: number;
      quantity: number;
      unit?: string;
      notes?: string | null;
    }[];
  }): Promise<QuotationRequestDTO> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.quotationRequest.create({
          data: {
            customerName: data.customerName,
            companyName: data.companyName,
            phone: data.phone,
            email: data.email,
            notes: data.notes,
            status: "PENDING",
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                requestedWeight: new Decimal(item.requestedWeight),
                quantity: item.quantity,
                unit: item.unit || "kg",
                notes: item.notes,
              })),
            },
          },
          include: {
            items: {
              include: { product: true },
            },
          },
        });

        return {
          id: created.id,
          customerName: created.customerName,
          companyName: created.companyName,
          phone: created.phone,
          email: created.email,
          notes: created.notes,
          status: created.status as QuotationStatus,
          items: created.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            requestedWeight: Number(item.requestedWeight),
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
          })),
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback to in-memory on error
      }
    }

    const quotation: QuotationRequestDTO = {
      id: `QUOT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: data.customerName,
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      status: "PENDING",
      items: data.items.map((item) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        requestedWeight: item.requestedWeight,
        quantity: item.quantity,
        unit: item.unit || "kg",
        notes: item.notes,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryQuotations.unshift(quotation);
    return quotation;
  }

  async findAll(params?: { status?: string }): Promise<QuotationRequestDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = { deletedAt: null };
        if (params?.status) where.status = params.status;

        const list = await prisma.quotationRequest.findMany({
          where,
          include: {
            items: { include: { product: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        return list.map((q) => ({
          id: q.id,
          customerName: q.customerName,
          companyName: q.companyName,
          phone: q.phone,
          email: q.email,
          notes: q.notes,
          status: q.status as QuotationStatus,
          items: q.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            productName: it.product.name,
            requestedWeight: Number(it.requestedWeight),
            quantity: it.quantity,
            unit: it.unit,
            notes: it.notes,
          })),
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
        }));
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryQuotations;
  }

  async updateStatus(id: string, status: QuotationStatus): Promise<QuotationRequestDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updated = await prisma.quotationRequest.update({
          where: { id },
          data: { status },
          include: { items: { include: { product: true } } },
        });
        return {
          id: updated.id,
          customerName: updated.customerName,
          companyName: updated.companyName,
          phone: updated.phone,
          email: updated.email,
          notes: updated.notes,
          status: updated.status as QuotationStatus,
          items: updated.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            productName: it.product.name,
            requestedWeight: Number(it.requestedWeight),
            quantity: it.quantity,
            unit: it.unit,
          })),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    const q = inMemoryQuotations.find((item) => item.id === id);
    if (!q) return null;
    q.status = status;
    q.updatedAt = new Date().toISOString();
    return q;
  }
}

export const quotationRepository = new QuotationRepository();
