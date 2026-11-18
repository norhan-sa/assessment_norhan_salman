import type { Response } from "express";

export type ApiError = {
  message: string;
  field?: string;
};

export function sendSuccessMessage(res: Response, data: unknown, status = 200) {
  res.status(status).json({ success: true, data: data });
}

export function sendErrorMessage(res: Response, errors: ApiError[], status: number) {
  res.status(status).json({ success: false, data: null, errors: errors });
}
