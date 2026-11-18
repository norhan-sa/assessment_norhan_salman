import { z } from "zod";
import {
  DESCRIPTION_MAX_LENGTH,
  PRIORITY_ENUM,
  STATUS_ENUM,
  TITLE_MAX_LENGTH,
} from "./tasks_model";

const taskFields = {
  title: z
    .string("Title is required and must be a string")
    .trim()
    .min(1, "Title length must be at least 1")
    .max(TITLE_MAX_LENGTH, `Title length must be at most ${TITLE_MAX_LENGTH}`),
  description: z
    .string("Description must be a string")
    .trim()
    .max(DESCRIPTION_MAX_LENGTH, `Description length must be at most ${DESCRIPTION_MAX_LENGTH}`),
  status: z.enum(STATUS_ENUM, `Status must be one of: ${STATUS_ENUM.join(", ")}`),
  priority: z.enum(PRIORITY_ENUM, `Priority must be one of: ${PRIORITY_ENUM.join(", ")}`),
  dueDate: z.iso
    .datetime({
      offset: true,
      error: "The date must follow ISO format, e.g. 2026-11-18T09:00:00Z",
    })
    .transform((value) => new Date(value)),
};

export const createTaskSchema = z.strictObject({
  title: taskFields.title,
  description: taskFields.description.optional(),
  status: taskFields.status.optional(),
  priority: taskFields.priority,
  dueDate: taskFields.dueDate.optional(),
});

export const updateTaskSchema = z
  .strictObject({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    dueDate: taskFields.dueDate.optional(),
  })
  .refine((body) => Object.keys(body).length >= 1, {
    message: "Please provide at least one field to update",
  });

export const paginationParamSchema = z.strictObject({
  page: z.coerce.number("Page must be a number").int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number("Limit must be a number")
    .int()
    .min(1, "Page size must be at least 1")
    .max(50, "Page size must be at most 50")
    .default(20),
});

export const listTasksSchema = paginationParamSchema.extend({
  status: taskFields.status.optional(),
  priority: taskFields.priority.optional(),
});
