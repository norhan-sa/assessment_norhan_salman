import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { sendErrorMessage, sendSuccessMessage } from "../utils/response";
import { TasksModel } from "./tasks_model";
import { createTaskSchema, listTasksSchema, updateTaskSchema } from "./tasks_schema";

export const tasksRouter = Router();

tasksRouter.post("/", async (req, res) => {
  const data = createTaskSchema.parse(req.body ?? {});
  const task = await TasksModel.create(data);
  sendSuccessMessage(res, task, 201);
});

tasksRouter.get("/", async (req, res) => {
  const { page, limit, ...fields } = listTasksSchema.parse(req.query);

  const tasks = await TasksModel.find(fields)
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendSuccessMessage(res, tasks);
});

tasksRouter.get("/overdue", async (req, res) => {
  const { page, limit, status, ...fields } = listTasksSchema.parse(req.query);

  if (status === "done") {
    sendSuccessMessage(res, []);
    return;
  }

  const tasks = await TasksModel.find({
    ...fields,
    status: status ?? { $ne: "done" },
    dueDate: { $lt: new Date() },
  })
    .sort({ dueDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendSuccessMessage(res, tasks);
});

tasksRouter.patch("/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    sendErrorMessage(res, [{ message: "Please send correct task id", field: "id" }], 400);
    return;
  }

  const data = updateTaskSchema.parse(req.body ?? {});
  const task = await TasksModel.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: "after", runValidators: true },
  );

  if (!task) {
    sendErrorMessage(res, [{ message: "Task not found" }], 404);
    return;
  }

  sendSuccessMessage(res, task);
});

tasksRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    sendErrorMessage(res, [{ message: "Please send correct task id", field: "id" }], 400);
    return;
  }

  const task = await TasksModel.findByIdAndDelete(id);

  if (!task) {
    sendErrorMessage(res, [{ message: "Task not found" }], 404);
    return;
  }

  sendSuccessMessage(res, null);
});
