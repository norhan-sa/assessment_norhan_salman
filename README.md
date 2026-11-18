# Task management API

A small REST API for managing tasks, built with TypeScript, Express and MongoDB (Mongoose).

## How to run

You need Node 20 or newer.

```bash
npm install
cp .env.example .env
```

Start MongoDB. Pick one:

```bash
npm run db:memory   # in-memory MongoDB, nothing to install
npm run db:up       # MongoDB in Docker
```

Then in another terminal:

```bash
npm run dev
```

The API runs on http://localhost:3000.

## Tests

```bash
npm test
```

The tests use an in-memory MongoDB, so you don't need a database running.

## Task fields

| Field       | Notes                                           |
| ----------- | ----------------------------------------------- |
| id          | generated                                       |
| title       | required, 1 to 200 characters                   |
| description | optional, up to 2000 characters                 |
| status      | `todo`, `in_progress` or `done`, default `todo` |
| priority    | required, `low`, `medium` or `high`             |
| dueDate     | optional, ISO date like `2026-12-01T09:00:00Z`  |
| createdAt   | generated                                       |
| updatedAt   | generated                                       |

## Endpoints

| Method | Path           | What it does                               |
| ------ | -------------- | ------------------------------------------ |
| POST   | /tasks         | Create a task                              |
| GET    | /tasks         | List tasks                                 |
| PATCH  | /tasks/:id     | Update a task                              |
| DELETE | /tasks/:id     | Delete a task                              |
| GET    | /tasks/overdue | Tasks past their due date that aren't done |
| GET    | /health        | Health check                               |

`GET /tasks` and `GET /tasks/overdue` accept these query params:

- `status` and `priority` to filter
- `page` (default 1) and `limit` (default 20, max 50)

## Examples

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "low", "dueDate": "2026-12-01T09:00:00Z"}'
```

List high priority tasks that are still todo:

```bash
curl "http://localhost:3000/tasks?status=todo&priority=high"
```

Mark a task as done:

```bash
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

## Responses

Every response has the same shape.

Success:

```json
{ "success": true, "data": { "id": "...", "title": "Buy milk" } }
```

Error:

```json
{
  "success": false,
  "data": null,
  "errors": [{ "message": "Title is required and must be a string", "field": "title" }]
}
```

Status codes: `201` when a task is created, `400` for invalid input or a bad id, `404` when the
task doesn't exist.

## Project layout

```
src/
  server.ts                   starts the server
  app.ts                      express app and routes
  config/                     env and database connection
  middleware/errorHandler.ts  404 and error responses
  tasks/
    tasks_model.ts            mongoose model
    tasks_schema.ts           zod validation
    tasks_routes.ts           the endpoints
  utils/response.ts           response helpers
tests/
  health.test.ts
  tasks.test.ts
```

## Notes

What is done:

- All five endpoints from the assignment
- Input validation with zod
- Pagination on the list endpoints
- Tests for every endpoint

Decisions:

- Unknown fields in the body are rejected instead of ignored, so typos don't pass silently.
- `PATCH` needs at least one field.
- A task is overdue when its due date is before now and its status is not `done`.
- Tasks are listed newest first. Overdue tasks are listed by due date, oldest first.
- `DELETE` removes the task for real, there is no soft delete.

What I would do next:

- Return the total count with the list so clients can build pagination
- Add an index on `status` and `dueDate`
- Add `GET /tasks/:id`
- Add authentication so each user only sees their own tasks
