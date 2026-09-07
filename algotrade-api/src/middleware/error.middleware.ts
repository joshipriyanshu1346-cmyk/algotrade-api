import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: {},
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, "Unhandled server error");
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.details ?? {},
    });
    return;
  }

  logger.error({ err }, "Unexpected error");
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: {},
  });
}
