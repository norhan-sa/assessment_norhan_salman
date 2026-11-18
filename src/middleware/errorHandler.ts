import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { sendErrorMessage, type ApiError } from "../utils/response";

export const notFoundHandler: RequestHandler = (req, res) => {
  sendErrorMessage(res, [{ message: `Route ${req.method} ${req.path} not found` }], 404);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const errors: ApiError[] = err.issues.map((issue) => ({
      message: issue.message,
      ...(issue.path.length > 0 ? { field: issue.path.join(".") } : {}),
    }));
    sendErrorMessage(res, errors, 400);
    return;
  }

  const status = typeof err?.status === "number" ? err.status : 500;

  if (status >= 500) {
    console.error(err);
    sendErrorMessage(res, [{ message: "Something went wrong" }], status);
    return;
  }

  sendErrorMessage(res, [{ message: String(err.message) }], status);
};
