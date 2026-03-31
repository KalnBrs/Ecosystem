<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                        AGENT INSTRUCTIONS — READ FIRST                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

PURPOSE
  This file is the active sprint backlog for Ecosystem. It tracks exactly what
  needs to be built in the current phase. When starting a new session, read this
  file before any other agent_docs file. It tells you where we are and what to
  do next.

SESSION START PROTOCOL
  1. Read this file top-to-bottom.
  2. Find the first task with Status "[-]" — that's what was being worked on
     when the session ended. Resume it.
  3. If no task is In Progress, find the highest-priority [ ] Todo task
     (🔴 first, then 🟠) with no unresolved Blockers. Start that.
  4. When a phase is complete (all 🔴 and 🟠 tasks are [x] done), ask the user
     whether to advance to the next phase before pulling in new tasks.

COLUMN DEFINITIONS
  #          Unique task ID within this file (e.g., 1.1, 2.3). Used in Blockers.
  Status     [ ] = Todo | [-] = In Progress | [x] = Done
  Task       What needs to be done. Specific and independently actionable.
  Priority   🔴 = Critical (blocks everything) | 🟠 = High (current sprint) | 🔵 = Low (nice-to-have)
  Points     Fibonacci effort: 1=trivial, 2=easy, 3=medium, 5=large, 8=very large, 13=spike
  Blockers   Comma-separated task IDs that must be complete before this starts. "—" = none.
  Notes      Implementation hints, decisions, file paths, or caveats.

MARKING TASKS DONE
  Change the Status cell from [ ] or [-] to [x].
  Do NOT delete completed rows. They serve as history for future sessions.

ADDING NEW TASKS
  Append rows to the correct subsection table. Do not renumber existing IDs.
  New task IDs increment from the last ID in that subsection (e.g., after 1.6 add 1.7).

PHASE ADVANCEMENT
  When all 🔴 + 🟠 tasks in the current phase are [x] done, strike out the
  phase header and copy the next phase's task outline from "Future Phases"
  at the bottom of this file, expanding it into a full table.

IMPORTANT CONTEXT FILES
  - agent_docs/00-what_is_it.md  — Vision, features, roadmap
  - agent_docs/01-tech_stack.md  — Installed deps + all planned tech decisions
  - agent_docs/02-architecture.md — Data models, DB schema, API contracts, system design
  - src/lib/models/               — Source of truth for TypeScript model shapes
-->

# Implementation Plan

## Current Phase: Phase 1 — Foundation

**Goal:** Wire together the full request lifecycle end-to-end so that an authenticated user can create, read, update, and delete Nodes via the API with data persisted to PostgreSQL.

**Exit criteria:** All 🔴 and 🟠 tasks below are complete. A `curl` or REST client can authenticate and perform full CRUD on `/api/nodes` against a live database.

---

### Legend

**Priority**

| Color | Level    | Meaning                                                       |
| ----- | -------- | ------------------------------------------------------------- |
| 🔴    | Critical | Blocks all other work. Must be done before any 🟠 tasks.      |
| 🟠    | High     | Current sprint target. All should complete before phase ends. |
| 🔵    | Low      | Nice-to-have this phase. Pull in if time allows.              |

**Points — Fibonacci Effort Scale**

| Points | Scale      | What it looks like                                          |
| ------ | ---------- | ----------------------------------------------------------- |
| 1      | Trivial    | Run a single CLI command, flip a config value               |
| 2      | Easy       | Install + configure a package, write a short config file    |
| 3      | Medium     | Write one service method, define a schema, new API route    |
| 5      | Large      | Full feature: validation + service + route + error handling |
| 8      | Very Large | Multi-file feature, likely spanning 2+ work sessions        |
| 13     | Spike      | Unknown complexity — requires research before estimating    |

**Status**

| Symbol | Meaning     |
| ------ | ----------- |
| `[ ]`  | Todo        |
| `[-]`  | In Progress |
| `[x]`  | Done        |

---

## Phase 1 Tasks

### 1. Project Setup & Dependencies

| #   | Status | Task                                                                    | Priority | Points | Blockers | Notes                                                                                         |
| --- | ------ | ----------------------------------------------------------------------- | -------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| 1.1 | [ ]    | Install Prisma ORM + postgres client (`prisma`, `@prisma/client`, `pg`) | 🔴       | 2      | —        | `npm install prisma @prisma/client` + `npx prisma init`. Generates `prisma/schema.prisma`.    |
| 1.2 | [ ]    | Install NextAuth.js (`next-auth`)                                       | 🔴       | 1      | —        | `npm install next-auth`. Use latest v4 (v5 beta not yet stable enough).                       |
| 1.3 | [ ]    | Install Redux Toolkit + react-redux                                     | 🟠       | 1      | —        | `npm install @reduxjs/toolkit react-redux`. Needed by UI phases, not by API.                  |
| 1.4 | [ ]    | Install Zod                                                             | 🔴       | 1      | —        | `npm install zod`. Used for request body validation in all API routes.                        |
| 1.5 | [ ]    | Create `.env.local` template + `.env.example`                           | 🔴       | 1      | —        | Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Commit only `.env.example`. |
| 1.6 | [ ]    | Provision dev PostgreSQL database                                       | 🔴       | 2      | 1.5      | Recommended: Neon free tier. Set `DATABASE_URL` in `.env.local`.                              |

---

### 2. Database Foundation

| #   | Status | Task                                                        | Priority | Points | Blockers | Notes                                                                                                                               |
| --- | ------ | ----------------------------------------------------------- | -------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | [ ]    | Write Prisma schema (`users`, `nodes`, `node_links` tables) | 🔴       | 3      | 1.1      | Match schema exactly from `02-architecture.md`. Include JSONB `data` column on `nodes`. Add GIN index on `data`.                    |
| 2.2 | [ ]    | Run first migration (`prisma migrate dev --name init`)      | 🔴       | 1      | 2.1, 1.6 | Generates `prisma/migrations/`. Verify tables via Prisma Studio or psql.                                                            |
| 2.3 | [ ]    | Write dev seed script (`prisma/seed.ts`)                    | 🟠       | 2      | 2.2      | Seed 1 test user + a few sample Nodes of each type. Register in `package.json` as `"prisma": { "seed": "ts-node prisma/seed.ts" }`. |
| 2.4 | [ ]    | Verify schema with Prisma Studio (`npx prisma studio`)      | 🟠       | 1      | 2.2      | Smoke test only. Confirm all columns, relations, and constraints are correct.                                                       |

---

### 3. Authentication

| #   | Status | Task                                                   | Priority | Points | Blockers | Notes                                                                                                                             |
| --- | ------ | ------------------------------------------------------ | -------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | [ ]    | Configure NextAuth.js credentials provider             | 🔴       | 3      | 1.2, 2.2 | `CredentialsProvider` with email + bcrypt password check against `users` table. Store in `src/lib/auth.ts`.                       |
| 3.2 | [ ]    | Create `/api/auth/[...nextauth]/route.ts` handler      | 🔴       | 1      | 3.1      | App Router catch-all. Export `GET` and `POST` from NextAuth handler.                                                              |
| 3.3 | [ ]    | Add `getServerSession` guard helper                    | 🟠       | 2      | 3.2      | Utility at `src/lib/session.ts`: wraps `getServerSession(authOptions)` and throws 401 if unauthenticated. Used by all API routes. |
| 3.4 | [ ]    | Create `AuthService.ts` (signUp with password hashing) | 🟠       | 2      | 3.3      | `src/services/AuthService.ts`. `signUp(email, password, name)` — hash with bcrypt, insert user. Handle duplicate email error.     |
| 3.5 | [ ]    | `POST /api/auth/signup` route                          | 🟠       | 2      | 3.4      | Validates body with Zod, calls `AuthService.signUp`. Returns 201 on success, 409 on duplicate.                                    |
| 3.6 | [ ]    | Basic login + signup page UI                           | 🔵       | 5      | 3.5      | Minimal form pages at `/login` and `/signup`. Not a design priority — functional only.                                            |

---

### 4. Core Node API

| #   | Status | Task                                                              | Priority | Points | Blockers      | Notes                                                                                                                            |
| --- | ------ | ----------------------------------------------------------------- | -------- | ------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | [ ]    | Write Zod schemas for Node request/response bodies                | 🔴       | 3      | 1.4           | `src/lib/schemas/node.schema.ts`. Schemas for create, update (partial), and each subtype's `data` payload.                       |
| 4.2 | [ ]    | Create `NodeService.ts` skeleton                                  | 🔴       | 3      | 2.2           | `src/services/NodeService.ts`. Methods: `createNode`, `getNodeById`, `listNodes`, `updateNode`, `deleteNode`. Use Prisma client. |
| 4.3 | [ ]    | `GET /api/nodes` — list all nodes for authenticated user          | 🔴       | 2      | 3.3, 4.1, 4.2 | Scoped to `userId` from session. Support optional `?type=` query param filter. Returns array of nodes.                           |
| 4.4 | [ ]    | `POST /api/nodes` — create a new node                             | 🔴       | 2      | 4.3           | Validates body with Zod. Generates `id` (UUID), sets `createdAt`/`updatedAt`. Returns 201 + created node.                        |
| 4.5 | [ ]    | `GET /api/nodes/[id]` — get a single node by ID                   | 🟠       | 1      | 4.3           | Returns 404 if not found or not owned by session user.                                                                           |
| 4.6 | [ ]    | `PUT /api/nodes/[id]` — partial update a node                     | 🟠       | 2      | 4.5           | Merges `data` JSONB field (don't overwrite unrelated keys). Updates `updatedAt`. Returns updated node.                           |
| 4.7 | [ ]    | `DELETE /api/nodes/[id]` — soft delete (set `status = "deleted"`) | 🟠       | 1      | 4.5           | Does not remove the DB row. Returns 204 on success.                                                                              |
| 4.8 | [ ]    | Node ownership guard (shared middleware helper)                   | 🟠       | 2      | 3.3           | `src/lib/nodeGuard.ts`: fetches node, verifies `userId` matches session. Throws 403 if mismatch. Reused by 4.5, 4.6, 4.7.        |

---

## Phase Overview (Future Phases — Detail TBD)

> Expand the relevant section into a full task table when the current phase is complete.

### Phase 2 — Redux Store + Window Manager

- Set up Redux store with slices: `nodesSlice`, `windowsSlice`, `authSlice`
- Prototype window manager (evaluate `react-mosaic-layout` vs. `react-resizable-panels`)
- Connect Node API calls to Redux via RTK Query or `createAsyncThunk`
- Basic layout shell: sidebar, window container

### Phase 3 — Core UI: Dashboard & Node Cards

- Node card component (renders Task / Event / Idea / Project variants)
- Dashboard view: Today's Tasks, Overdue Tasks, Active Projects, Upcoming Deadlines
- Create/edit Node modal
- Time-window aware layout (morning vs. day vs. evening defaults)

### Phase 4 — Calendar

- Calendar views: Day, Week, Month
- Drag-and-drop Node to time slot (updates `dueDate` / `startTime`)
- Event rendering on time grid

### Phase 5 — Projects & Inbox

- Project hierarchy view (Area → Project → Nodes)
- Overdue task triage flow (Reschedule / Scrap)
- Brain Dump inbox (raw Idea nodes)
- Node conversion (right-click → change type)

### Phase 6 — Universal Search + Polish (v1.1)

- Global omnibar (`Cmd+K`)
- Full-text search + filter syntax (`type:task`, `due:today`, etc.)
- Google Calendar sync (OAuth, two-way Event sync)
- Performance audit, error boundaries, loading states

### Phase 7 — AI & Advanced Features (v2+)

- Brain Dump AI analysis (background, non-blocking)
- Auto-tagging and Node type suggestions
- Habit tracking
- Wiki-style Node linking and backlinks
