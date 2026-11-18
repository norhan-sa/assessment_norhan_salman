import { model, Schema } from "mongoose";

export const STATUS_ENUM = ["todo", "in_progress", "done"] as const;
export const PRIORITY_ENUM = ["low", "medium", "high"] as const;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;

const tasksSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: TITLE_MAX_LENGTH, trim: true },
    description: { type: String, default: "", maxLength: DESCRIPTION_MAX_LENGTH },
    status: { type: String, enum: [...STATUS_ENUM], default: "todo" },
    priority: { type: String, enum: [...PRIORITY_ENUM], required: true },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const TasksModel = model("Tasks", tasksSchema);
