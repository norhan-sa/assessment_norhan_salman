import express, { type Express } from "express";
import { isDatabaseConnected } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { tasksRouter } from "./tasks/tasks_routes";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      database: isDatabaseConnected() ? "connected" : "disconnected",
    });
  });

  app.use("/tasks", tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
