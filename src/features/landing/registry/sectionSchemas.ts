/**
 * Normalization helpers to prevent malformed or null content from crashing sections
 */

export function safeObject<T = Record<string, any>>(val: unknown, fallback: T = {} as T): T {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return val as T;
  }
  return fallback;
}

export function safeArray<T = any>(val: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(val)) {
    return val;
  }
  return fallback;
}

export function safeString(val: unknown, fallback: string = ""): string {
  if (typeof val === "string") {
    return val;
  }
  if (val !== null && val !== undefined) {
    return String(val);
  }
  return fallback;
}

export function safeNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === "number" && !isNaN(val)) {
    return val;
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function safeBoolean(val: unknown, fallback: boolean = false): boolean {
  if (typeof val === "boolean") {
    return val;
  }
  if (val === "true" || val === 1) return true;
  if (val === "false" || val === 0) return false;
  return fallback;
}
