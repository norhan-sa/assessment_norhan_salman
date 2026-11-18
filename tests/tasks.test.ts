import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();

const pastDate = "2020-01-01T00:00:00Z";
const futureDate = "2999-01-01T00:00:00Z";
const unknownId = "64b7f0f0f0f0f0f0f0f0f0f0";

async function addTask(task: object) {
  const res = await request(app).post("/tasks").send(task);
  return res.body.data;
}

describe("POST /tasks", () => {
  it("creates a task", async () => {
    const res = await request(app).post("/tasks").send({ title: "Buy milk", priority: "low" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe("Buy milk");
    expect(res.body.data.priority).toBe("low");
    expect(res.body.data.createdAt).toBeDefined();
  });

  it("sets status to todo by default", async () => {
    const res = await request(app).post("/tasks").send({ title: "Buy milk", priority: "low" });

    expect(res.body.data.status).toBe("todo");
  });

  it("saves the due date", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Buy milk", priority: "low", dueDate: futureDate });

    expect(res.status).toBe(201);
    expect(res.body.data.dueDate).toBe("2999-01-01T00:00:00.000Z");
  });

  it("fails without a title", async () => {
    const res = await request(app).post("/tasks").send({ priority: "low" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].field).toBe("title");
  });

  it("fails with a wrong priority", async () => {
    const res = await request(app).post("/tasks").send({ title: "Buy milk", priority: "urgent" });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("priority");
  });

  it("fails with a wrong due date", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Buy milk", priority: "low", dueDate: "tomorrow" });

    expect(res.status).toBe(400);
  });

  it("fails with a field that does not exist", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Buy milk", priority: "low", owner: "me" });

    expect(res.status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("returns an empty list when there are no tasks", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns all tasks, newest first", async () => {
    await addTask({ title: "first", priority: "low" });
    await addTask({ title: "second", priority: "low" });

    const res = await request(app).get("/tasks");

    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].title).toBe("second");
    expect(res.body.data[1].title).toBe("first");
  });

  it("filters by status", async () => {
    await addTask({ title: "finished", priority: "low", status: "done" });
    await addTask({ title: "not started", priority: "low" });

    const res = await request(app).get("/tasks?status=done");

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("finished");
  });

  it("filters by priority", async () => {
    await addTask({ title: "important", priority: "high" });
    await addTask({ title: "can wait", priority: "low" });

    const res = await request(app).get("/tasks?priority=high");

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("important");
  });

  it("supports page and limit", async () => {
    await addTask({ title: "one", priority: "low" });
    await addTask({ title: "two", priority: "low" });
    await addTask({ title: "three", priority: "low" });

    const res = await request(app).get("/tasks?page=2&limit=2");

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("one");
  });

  it("fails with a wrong status filter", async () => {
    const res = await request(app).get("/tasks?status=finished");

    expect(res.status).toBe(400);
  });

  it("fails when limit is more than 50", async () => {
    const res = await request(app).get("/tasks?limit=100");

    expect(res.status).toBe(400);
  });
});

describe("PATCH /tasks/:id", () => {
  it("updates the status", async () => {
    const task = await addTask({ title: "Buy milk", priority: "low" });

    const res = await request(app).patch(`/tasks/${task.id}`).send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("done");
  });

  it("does not change the other fields", async () => {
    const task = await addTask({ title: "Buy milk", priority: "low", description: "2 bottles" });

    const res = await request(app).patch(`/tasks/${task.id}`).send({ priority: "high" });

    expect(res.body.data.priority).toBe("high");
    expect(res.body.data.title).toBe("Buy milk");
    expect(res.body.data.description).toBe("2 bottles");
  });

  it("fails with an empty body", async () => {
    const task = await addTask({ title: "Buy milk", priority: "low" });

    const res = await request(app).patch(`/tasks/${task.id}`).send({});

    expect(res.status).toBe(400);
  });

  it("fails with a wrong status", async () => {
    const task = await addTask({ title: "Buy milk", priority: "low" });

    const res = await request(app).patch(`/tasks/${task.id}`).send({ status: "finished" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the id is not valid", async () => {
    const res = await request(app).patch("/tasks/123").send({ status: "done" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the task does not exist", async () => {
    const res = await request(app).patch(`/tasks/${unknownId}`).send({ status: "done" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /tasks/:id", () => {
  it("deletes the task", async () => {
    const task = await addTask({ title: "Buy milk", priority: "low" });

    const res = await request(app).delete(`/tasks/${task.id}`);
    expect(res.status).toBe(200);

    const list = await request(app).get("/tasks");
    expect(list.body.data.length).toBe(0);
  });

  it("returns 400 when the id is not valid", async () => {
    const res = await request(app).delete("/tasks/123");

    expect(res.status).toBe(400);
  });

  it("returns 404 when the task does not exist", async () => {
    const res = await request(app).delete(`/tasks/${unknownId}`);

    expect(res.status).toBe(404);
  });
});

describe("GET /tasks/overdue", () => {
  it("returns tasks with a due date in the past", async () => {
    await addTask({ title: "late", priority: "low", dueDate: pastDate });
    await addTask({ title: "on time", priority: "low", dueDate: futureDate });
    await addTask({ title: "no due date", priority: "low" });

    const res = await request(app).get("/tasks/overdue");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("late");
  });

  it("does not return done tasks", async () => {
    await addTask({ title: "late but done", priority: "low", dueDate: pastDate, status: "done" });

    const res = await request(app).get("/tasks/overdue");

    expect(res.body.data).toEqual([]);
  });

  it("filters by priority", async () => {
    await addTask({ title: "late and important", priority: "high", dueDate: pastDate });
    await addTask({ title: "late", priority: "low", dueDate: pastDate });

    const res = await request(app).get("/tasks/overdue?priority=high");

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("late and important");
  });
});
