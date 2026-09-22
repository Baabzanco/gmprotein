import path from "path";
import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { checkDatabaseConnection } from "./config/prisma";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

async function startServer() {
  const app = createApp();

  // Test Database connectivity in background without blocking server startup
  checkDatabaseConnection().then(({ connected, message }) => {
    if (connected) {
      logger.info("Database connection validated.");
    } else {
      logger.info(`Notice: Running with integrated persistent repository store (${message}).`);
    }
  });

  // Vite integration:
  // In development: mount Vite dev server as middleware
  // In production: serve built assets from dist/
  if (config.nodeEnv !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      logger.info("Vite middleware mounted in development mode.");
    } catch (viteError) {
      logger.error("Failed to initialize Vite middleware:", viteError);
    }
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(await import("express").then((m) => m.default.static(distPath)));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return notFoundHandler(req, res);
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Catch-all 404 for unhandled API routes
  app.use("/api/*", notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  const server = app.listen(config.port, "0.0.0.0", () => {
    logger.info(`Protein Golmohammadi server running on http://0.0.0.0:${config.port}`);
    logger.info(`Interactive API Docs available at http://0.0.0.0:${config.port}/api/docs`);
    logger.info(`Public API v1 ready at http://0.0.0.0:${config.port}/api/v1`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        const { getPrismaClient } = await import("./config/prisma");
        await getPrismaClient().$disconnect();
      } catch (e) {}
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  logger.error("Critical error during server boot:", err);
  process.exit(1);
});
