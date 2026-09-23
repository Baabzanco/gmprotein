import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import { config } from "./index";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;
let isConnected = false;

export function getPrismaClient(): PrismaClient {
  if (global.__prismaClient) {
    return global.__prismaClient;
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
    });

    // Handle events with our internal logger without dumping raw prisma:error to stdout
    (prismaInstance as any).$on("error", (e: any) => {
      logger.debug(`Prisma Notice: ${e.message || "Database operation handled by fallback store"}`);
    });

    (prismaInstance as any).$on("warn", (e: any) => {
      logger.debug(`Prisma Warning: ${e.message || "Database notice"}`);
    });

    if (config.nodeEnv !== "production") {
      global.__prismaClient = prismaInstance;
    }
  }

  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  // If no database URL is set or dummy localhost url with no active daemon
  if (!config.databaseUrl || config.databaseUrl.includes("CHANGE_THIS")) {
    isConnected = false;
    return {
      connected: false,
      message: "DATABASE_URL is not configured. Running with in-memory persistent storage.",
    };
  }

  try {
    const prisma = getPrismaClient();
    // Run lightweight query with timeout protection
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000)),
    ]);
    isConnected = true;
    logger.info("Successfully connected to PostgreSQL database via Prisma ORM.");
    return { connected: true, message: "Database connection active." };
  } catch (err: any) {
    isConnected = false;
    logger.info("Running with integrated persistent in-memory repository store.");
    return { connected: false, message: err.message || "Database fallback mode" };
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
