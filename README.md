# Task management API — starter repository

Starting point for the technical assessment: TypeScript, Node.js, Express and
MongoDB (via Mongoose), with the database connection already configured. No
task features are implemented yet.

## Getting started

```bash
npm install
```

Start MongoDB, using whichever option suits your machine:

```bash
npm run db:memory   # in-memory MongoDB, no install needed (data is lost on stop)
```

```bash
npm run db:up       # MongoDB in Docker (data is kept in a volume)
```

Then, in a second terminal, start the API with auto-reload:

```bash
npm run dev
```

Check it is running:

```bash
curl http://localhost:3000/health
```

Settings live in `.env` (see `.env.example`): `HOST` (defaults to
`localhost`), `PORT` and `MONGODB_URI`.

## Scripts

| Script               | What it does                                        |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Run the API with auto-reload                        |
| `npm test`           | Run the tests against a throwaway in-memory MongoDB |
| `npm run test:watch` | Run the tests in watch mode                         |
| `npm run typecheck`  | Type-check the whole project                        |
| `npm run build`      | Compile `src` to `dist`                             |

## Project layout

```
src/
  server.ts                 entry point: connects to MongoDB, starts the HTTP server
  app.ts                    builds the Express app; register routers here
  config/env.ts             reads and validates environment variables
  config/database.ts        MongoDB connection helpers
  middleware/errorHandler.ts  JSON 404 and error responses
tests/
  setup.ts                  starts an in-memory MongoDB and empties it between tests
  health.test.ts            example test using supertest
scripts/dev-db.ts           the in-memory MongoDB behind `npm run db:memory`
```

Installed and ready to use: `express`, `mongoose`, `zod` (validation),
`vitest` and `supertest` (testing).

## The assignment

Build a small REST API for managing tasks.

Each task has:

- a unique identifier
- a title and description
- a status: `todo`, `in_progress` or `done`
- a priority: `low`, `medium` or `high`
- a creation timestamp
- an optional due date

Endpoints:

1. `POST /tasks` — create a task, with a default status of `todo`
2. `GET /tasks` — list tasks, optionally filtered by status or priority
3. `PATCH /tasks/:id` — update a task's status, priority or other properties
4. `DELETE /tasks/:id` — remove a task
5. `GET /tasks/overdue` — tasks whose due date has passed and whose status is not `done`

Also consider input validation, unexpected situations, and keeping the code
understandable and maintainable. Tests and documentation are welcome.

## What to submit

- Source code (Git repository or ZIP)
- Screen recording
- A brief note: what you completed, what you would do next, and decisions worth mentioning
