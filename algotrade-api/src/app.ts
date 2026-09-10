import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";
import authRoutes from "./modules/auth/routes/auth.routes";

export function createApp(): Express {
  const app = express();

  const allowedOrigins = new Set(
    env.CLIENT_URL
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean)
  );

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);

      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  };

  // Security
  app.use(helmet());

  // CORS MUST be before routes
  app.use(cors(corsOptions));

  // Explicit preflight handling
  app.options(/.*/, cors(corsOptions));

  // Body parsers
  app.use(express.json());
  app.use(cookieParser());

  // Logger
  app.use(pinoHttp({ logger }));

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "OK",
      data: {
        status: "healthy",
      },
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}