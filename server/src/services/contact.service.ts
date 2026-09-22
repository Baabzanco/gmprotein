import { contactRepository } from "../repositories/contact.repository";
import { auditRepository } from "../repositories/audit.repository";
import { ContactRequestDTO } from "../../../shared/types";

export class ContactService {
  async submitContact(
    data: {
      name: string;
      phone: string;
      company?: string | null;
      email?: string | null;
      subject: string;
      message: string;
    },
    ipAddress?: string,
    userAgent?: string
  ): Promise<ContactRequestDTO> {
    const contact = await contactRepository.create(data);

    await auditRepository.log({
      action: "CONTACT_REQUEST_SUBMITTED",
      entity: "ContactRequest",
      entityId: contact.id,
      metadata: {
        name: contact.name,
        phone: contact.phone,
        subject: contact.subject,
      },
      ipAddress,
      userAgent,
    });

    return contact;
  }

  async getAll(params?: { status?: string }): Promise<ContactRequestDTO[]> {
    return contactRepository.findAll(params);
  }

  async updateStatus(id: string, status: any, userId?: string): Promise<ContactRequestDTO | null> {
    const updated = await contactRepository.updateStatus(id, status);
    if (updated) {
      await auditRepository.log({
        userId,
        action: "CONTACT_STATUS_UPDATED",
        entity: "ContactRequest",
        entityId: id,
        metadata: { status },
      });
    }
    return updated;
  }
}

export const contactService = new ContactService();
