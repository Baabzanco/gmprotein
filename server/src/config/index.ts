import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "protein_golmohammadi_super_secure_jwt_secret_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : ["http://localhost:3000", "http://localhost:5173"],
  adminEmail: process.env.ADMIN_EMAIL || "admin@golmohamadi.com",
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || "Admin@PG2026!",
  apiVersion: "v1",
};
