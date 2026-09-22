import fs from "fs";
import path from "path";

export interface SystemSettings {
  siteName: string;
  brandTagline: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  heroVideoUrl: string;
  heroScrollMultiplier: number;
  heroVideoMetadata?: {
    originalName?: string;
    fileName?: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  };
  primaryColor: string;
  accentColor: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  orderNotice: string;
  enablePublicQuotations: boolean;
  enableSmsNotifications: boolean;
  maintenanceMode: boolean;
  freeDeliveryThreshold: number;
  updatedAt: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: "پروتئین گلمحمدی",
  brandTagline: "برش‌های تخصصی، طعم اصیل و زنجیره سرد استاندارد",
  phone: "۰۲۱-۲۲۰۰۳۳۴۴",
  mobile: "۰۹۱۲۰۰۰۰۰۰۰",
  email: "info@golmohamadi.com",
  address: "تهران، خیابان شریعتی، بالاتر از پل رومی، مجتمع پروتئین گلمحمدی",
  heroVideoUrl: "https://golmohamadi.com/wp-content/uploads/2026/09/Create-A-Single-Continuous-Cin-3.mp4",
  heroScrollMultiplier: 4.5,
  primaryColor: "#124A57",
  accentColor: "#CD78B3",
  defaultMetaTitle: "پروتئین گلمحمدی | تجربه گوشت لوکس و استیک‌های تخصصی",
  defaultMetaDescription: "تأمین‌کننده مستقیم برش‌های استیک گوساله، دنده شاندیزی و گوشت پرواری دستچین.",
  orderNotice: "کلیه سفارش‌های رسمی تهران ظرف کمتر از ۴ ساعت با خودروهای یخچال‌دار اختصاصی تحویل می‌گردند.",
  enablePublicQuotations: true,
  enableSmsNotifications: true,
  maintenanceMode: false,
  freeDeliveryThreshold: 20000000,
  updatedAt: new Date().toISOString(),
};

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const SETTINGS_FILE_PATH = path.join(UPLOADS_DIR, "system-settings.json");

/**
 * Loads system settings from filesystem or returns fallback defaults.
 */
export function loadPersistentSettings(): SystemSettings {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error("[PersistentSettings] Error reading runtime settings file, falling back to defaults:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Saves system settings atomically to filesystem.
 */
export function savePersistentSettings(settings: Partial<SystemSettings>): SystemSettings {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const current = loadPersistentSettings();
    const updated: SystemSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    const tempPath = `${SETTINGS_FILE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(updated, null, 2), "utf-8");
    fs.renameSync(tempPath, SETTINGS_FILE_PATH);

    return updated;
  } catch (err) {
    console.error("[PersistentSettings] Error saving runtime settings to filesystem:", err);
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
  }
}
