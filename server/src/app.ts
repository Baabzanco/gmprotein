import fs from "fs";
import path from "path";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { logger } from "./utils/logger";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import v1Routes from "./routes/v1";
import { setupSwagger } from "./config/swagger";

export function createApp(): Express {
  const app = express();

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const videosDir = path.join(uploadsDir, "videos");
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Trust proxy for rate limiting behind reverse proxies (like Cloud Run / Nginx)
  app.set("trust proxy", 1);

  // Security headers with relaxed CSP for local/preview development
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (
          config.corsOrigins.includes(origin) ||
          origin.startsWith("http://localhost:") ||
          origin.includes("run.app") ||
          origin.includes("google.com")
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in preview environment
      },
      credentials: true,
    })
  );

  // Serve uploaded static assets with video streaming headers
  app.use(
    "/uploads",
    express.static(uploadsDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".mp4") || filePath.endsWith(".webm") || filePath.endsWith(".mov")) {
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // Request body parsing supporting up to 100MB for video uploads
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // HTTP Request Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.originalUrl.startsWith("/api/")) {
        logger.debug(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`, {
          ip: req.ip,
          status: res.statusCode,
          duration,
        });
      }
    });
    next();
  });

  // Interactive OpenAPI / Swagger Documentation
  setupSwagger(app);

  // Mount API v1 Routes under Rate Limiter
  app.use("/api/v1", apiLimiter, v1Routes);

  // Global API health
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "protein-golmohammadi-api",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
