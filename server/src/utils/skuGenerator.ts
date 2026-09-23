import { getPrismaClient, isDatabaseConnected } from "../config/prisma";

/**
 * Derives a deterministic 3 to 4 uppercase letter code from category slug or name
 */
export function getCategoryCode(categorySlugOrName?: string): string {
  if (!categorySlugOrName) return "PROD";
  const normalized = categorySlugOrName.toLowerCase().trim();

  if (normalized.includes("beef") || normalized.includes("گوساله")) return "BEEF";
  if (normalized.includes("lamb") || normalized.includes("گوسفند")) return "LAMB";
  if (normalized.includes("special") || normalized.includes("خاص") || normalized.includes("باربیکیو")) return "SPEC";
  if (normalized.includes("sale") || normalized.includes("discount") || normalized.includes("تخفیف")) return "SALE";
  if (normalized.includes("chicken") || normalized.includes("مرغ") || normalized.includes("طیور")) return "CHIC";
  if (normalized.includes("fillet") || normalized.includes("فیله")) return "FIL";
  if (normalized.includes("steak") || normalized.includes("استیک")) return "STK";
  if (normalized.includes("portion") || normalized.includes("چرخ‌کرده")) return "PORT";

  // Clean ASCII slug first
  const cleanSlug = normalized.replace(/[^a-z0-9]/g, "");
  if (cleanSlug.length >= 3) {
    return cleanSlug.substring(0, 4).toUpperCase();
  }

  return "PROD";
}

/**
 * Deterministically generates a unique SKU code based on category and existing counts.
 * E.g., PG-BEEF-001, PG-LAMB-004
 */
export async function generateProductSku(
  categoryId: string,
  categorySlugOrName?: string,
  existingSkuList: string[] = []
): Promise<string> {
  const prefix = getCategoryCode(categorySlugOrName);
  
  if (isDatabaseConnected()) {
    try {
      const prisma = getPrismaClient();
      const count = await prisma.product.count({
        where: {
          categoryId,
          deletedAt: null,
        },
      });

      let sequence = count + 1;
      let candidate = `PG-${prefix}-${String(sequence).padStart(3, "0")}`;

      // Check if candidate already exists in DB
      let existing = await prisma.product.findUnique({ where: { sku: candidate } });
      while (existing) {
        sequence++;
        candidate = `PG-${prefix}-${String(sequence).padStart(3, "0")}`;
        existing = await prisma.product.findUnique({ where: { sku: candidate } });
      }

      return candidate;
    } catch {
      // Fallback
    }
  }

  // Fallback for in-memory / offline mode
  const matchingSkus = existingSkuList.filter((s) => s.startsWith(`PG-${prefix}-`));
  let seq = matchingSkus.length + 1;
  let candidate = `PG-${prefix}-${String(seq).padStart(3, "0")}`;

  while (existingSkuList.includes(candidate)) {
    seq++;
    candidate = `PG-${prefix}-${String(seq).padStart(3, "0")}`;
  }

  return candidate;
}
