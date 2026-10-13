# Mini Ticket Tracker

A lightweight, Kanban-style support ticket tracker built for a 3–4 hour interview assignment. It uses React, TypeScript, Vite, Tailwind CSS, Redux Toolkit Query, Express, Prisma, PostgreSQL, Swagger UI, Zod, Vitest, and Supertest.

## Features

- Kanban columns for `open`, `in_progress`, and `closed` tickets.
- Create, read, edit, move, and delete tickets.
- Ticket title, optional description, category (defaults to `coding`), priority, status, and timestamps.
- Search and category filtering in the UI.
- REST list filtering by status/category and pagination (`page`, `limit`).
- Ticket counts grouped by status.
- Request validation and consistent JSON error responses.
- Interactive Swagger documentation at `/api-docs` and JSON spec at `/api-docs.json`.
- API integration tests with Vitest and Supertest.

## Requirements

- Node.js 22.x
- npm 10+
- PostgreSQL 14+ (local PostgreSQL or a hosted provider such as Neon)

## Setup

1. Copy `.env.example` to `.env` at the repository root and set `DATABASE_URL` to your PostgreSQL connection string.
2. Install dependencies from the root:

   ```bash
   npm install
   ```

3. Start a local PostgreSQL instance (optional if you already have PostgreSQL running):

   ```bash
   docker compose up -d postgres
   ```

4. Generate Prisma Client and create the database migration:

   ```bash
   npm run db:generate
   npm run db:migrate -- --name init
   ```

5. Start the API and frontend in separate processes:

   ```bash
   npm run dev
   ```

   - Frontend: <http://localhost:5173>
   - API health: <http://localhost:4000/health>
   - Swagger UI: <http://localhost:4000/api-docs>
   - Swagger JSON: <http://localhost:4000/api-docs.json>

   Alternatively, run `npm run dev:api` and `npm run dev:web` in separate terminals.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string; required for database operations |
| `PORT` | `4000` | Backend listening port; hosting providers can inject this |
| `NODE_ENV` | `development` | Runtime environment |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `VITE_API_URL` | `http://localhost:4000/api` | Frontend API base URL, baked in at build time |

Vite reads `VITE_API_URL` from the root `.env` when running from this workspace. Never commit `.env` or production credentials.

## API overview

All endpoints are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/tickets` | Create a ticket |
| `GET` | `/tickets` | List tickets; optional `status`, `category`, `page`, `limit` |
| `GET` | `/tickets/:id` | Get a ticket |
| `PATCH` | `/tickets/:id` | Update any editable fields, including status and priority |
| `DELETE` | `/tickets/:id` | Delete a ticket |
| `GET` | `/tickets/stats` | Count tickets by status and return total |

Example create body:

```json
{
  "title": "Fix login validation",
  "description": "Show a useful message for invalid credentials.",
  "category": "coding",
  "priority": "high"
}
```

List response shape:

```json
{
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

## Tests

Tests use the database configured by `DATABASE_URL`. Prefer a dedicated test database to avoid touching development or production data.

```bash
npm run db:generate
npm run db:migrate -- --name init
npm test
```

The integration suite covers creation, validation, updating a ticket, statistics, filtering/pagination, deletion, and not-found behavior. Test records created by the suite are cleaned up where appropriate.

## Production build

```bash
npm run build
npm run db:deploy
npm run start --workspace backend
```

Set production `DATABASE_URL`, `CORS_ORIGIN`, and `VITE_API_URL` in the deployment environment. `VITE_API_URL` must point to the deployed API base path, e.g. `https://your-api.example.com/api`, and the frontend must be rebuilt after changing it. For Render-style hosting, leave the backend root directory at the repository root when deploying this workspace monorepo, and use `npm ci --include=dev && npm exec --workspace=backend -- prisma generate && npm run build --workspace=backend` as the build command; use `npm run start --workspace=backend` as the start command.

## Decisions & Tradeoffs

I chose a single `Ticket` model with string categories instead of a separate category table because the initial workflow only needs a `coding` category and the assignment is time-boxed. Prisma and PostgreSQL provide typed persistence and a clear migration history without adding another data-access abstraction. Zod validates incoming payloads and query parameters at the API boundary, while a centralized error handler keeps error responses consistent. The UI uses RTK Query for server-state fetching, caching, mutations, and cache invalidation, while a small Redux slice stores only presentation filters. The Kanban board uses explicit status-transition buttons instead of a drag-and-drop dependency to reduce implementation and accessibility complexity. Swagger JSDoc keeps API documentation close to the route implementation and provides an interactive way to inspect endpoints. Integration tests exercise the Express application against a real PostgreSQL database instead of only testing isolated functions. With more time, I would add stronger end-to-end browser tests, more robust deployment-specific configuration, and a dedicated test database in CI. I would also consider keyboard-accessible drag-and-drop, category management, and more detailed audit history if product needs justified the extra complexity.

## Suggested incremental commit history

1. `chore: scaffold npm workspace and TypeScript apps`
2. `feat(api): add Prisma ticket model and migration`
3. `feat(api): implement ticket CRUD and stats endpoints`
4. `docs(api): add Swagger JSDoc documentation`
5. `test(api): cover ticket CRUD and stats flows`
6. `feat(web): add RTK Query ticket API and Kanban board`
7. `docs: add setup instructions and tradeoffs`
