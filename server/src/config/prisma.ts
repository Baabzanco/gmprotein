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
      log:
        config.nodeEnv === "development"
          ? [
              { emit: "event", level: "query" },
              { emit: "stdout", level: "error" },
              { emit: "stdout", level: "warn" },
            ]
          : [{ emit: "stdout", level: "error" }],
    });

    if (config.nodeEnv !== "production") {
      global.__prismaClient = prismaInstance;
    }
  }

  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!config.databaseUrl) {
    return {
      connected: false,
      message: "DATABASE_URL is not configured in environment variables.",
    };
  }

  try {
    const prisma = getPrismaClient();
    // Run simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    logger.info("Successfully connected to PostgreSQL database via Prisma ORM.");
    return { connected: true, message: "Database connection active." };
  } catch (err: any) {
    isConnected = false;
    logger.warn(`PostgreSQL connection notice: ${err.message || err}. Operating in fallback mode.`);
    return { connected: false, message: err.message || "Database connection failed" };
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
