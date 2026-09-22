import { quotationRepository } from "../repositories/quotation.repository";
import { auditRepository } from "../repositories/audit.repository";
import { QuotationRequestDTO, QuotationStatus } from "../../../shared/types";

export class QuotationService {
  async submitQuotation(
    data: {
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
    },
    ipAddress?: string,
    userAgent?: string
  ): Promise<QuotationRequestDTO> {
    const quotation = await quotationRepository.create(data);

    await auditRepository.log({
      action: "QUOTATION_SUBMITTED",
      entity: "QuotationRequest",
      entityId: quotation.id,
      metadata: {
        customerName: quotation.customerName,
        phone: quotation.phone,
        itemsCount: quotation.items.length,
      },
      ipAddress,
      userAgent,
    });

    return quotation;
  }

  async getAll(params?: { status?: string }): Promise<QuotationRequestDTO[]> {
    return quotationRepository.findAll(params);
  }

  async updateStatus(id: string, status: QuotationStatus, userId?: string): Promise<QuotationRequestDTO | null> {
    const updated = await quotationRepository.updateStatus(id, status);
    if (updated) {
      await auditRepository.log({
        userId,
        action: "QUOTATION_STATUS_UPDATED",
        entity: "QuotationRequest",
        entityId: id,
        metadata: { newStatus: status },
      });
    }
    return updated;
  }
}

export const quotationService = new QuotationService();
