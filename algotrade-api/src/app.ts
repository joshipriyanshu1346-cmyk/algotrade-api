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

  // Trust proxy for Render deployment
  app.set("trust proxy", 1);

  // Security
  app.use(helmet());

  // Allowed frontend origins
  const allowedOrigins = env.CLIENT_URL
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without origin (Postman, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        logger.warn(
          {
            origin,
            allowedOrigins,
          },
          "CORS blocked request"
        );

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },

      credentials: true,

      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],
    })
  );

  // Body parser
  app.use(express.json());

  // Cookies
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

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
