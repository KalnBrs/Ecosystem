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
| 1.1 | [x]    | Install Prisma ORM + postgres client (`prisma`, `@prisma/client`, `pg`) | 🔴       | 2      | —        | `npm install prisma @prisma/client pg` + `npx prisma init`. Generates `prisma/schema.prisma`. |
| 1.2 | [x]    | Install NextAuth.js (`next-auth`)                                       | 🔴       | 1      | —        | `npm install next-auth`. Use latest v4 (v5 beta not yet stable enough).                       |
| 1.3 | [x]    | Install Redux Toolkit + react-redux                                     | 🟠       | 1      | —        | `npm install @reduxjs/toolkit react-redux`. Needed by UI phases, not by API.                  |
| 1.4 | [x]    | Install Zod                                                             | 🔴       | 1      | —        | `npm install zod`. Used for request body validation in all API routes.                        |
| 1.5 | [x]    | Create `.env.local` template + `.env.example`                           | 🔴       | 1      | —        | Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Commit only `.env.example`. |
| 1.6 | [x]    | Provision dev PostgreSQL database                                       | 🔴       | 2      | 1.5      | Recommended: Neon free tier. Set `DATABASE_URL` in `.env.local`.                              |

---

### 2. Database Foundation

| #   | Status | Task                                                        | Priority | Points | Blockers | Notes                                                                                                                                                                                                                                                                                                                                                |
| --- | ------ | ----------------------------------------------------------- | -------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | [x]    | Write Prisma schema (`users`, `nodes`, `node_links` tables) | 🔴       | 3      | 1.1      | Match schema from `02-architecture.md`. `nodes` has JSONB `data` + `tags TEXT[]`. `node_links` has `source_node_id`/`target_node_id` FKs with `ON DELETE CASCADE` and a UNIQUE constraint. `linkedNodeIds` is **not** a column — it is resolved via JOIN at query time. **No sessions table** — NextAuth uses JWT, so no DB session table is needed. |
| 2.2 | [x]    | Run first migration (`prisma migrate dev --name init`)      | 🔴       | 1      | 2.1, 1.6 | Generates `prisma/migrations/`. Verify tables via Prisma Studio or psql.                                                                                                                                                                                                                                                                             |
| 2.3 | [x]    | Write dev seed script (`prisma/seed.ts`)                    | 🟠       | 2      | 2.2      | Seed 1 test user + a few sample Nodes of each type. Register in `package.json` as `"prisma": { "seed": "ts-node prisma/seed.ts" }` and add `ts-node` as a dev dependency (or use the repo's preferred TS runner).                                                                                                                                    |
| 2.4 | [x]    | Verify schema with Prisma Studio (`npx prisma studio`)      | 🟠       | 1      | 2.2      | Smoke test only. Confirm all columns, relations, and constraints are correct.                                                                                                                                                                                                                                                                        |

---

### 3. Authentication

| #   | Status | Task                                                   | Priority | Points | Blockers | Notes                                                                                                                                                                                                                                                               |
| --- | ------ | ------------------------------------------------------ | -------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | [x]    | Configure NextAuth.js credentials provider             | 🔴       | 3      | 1.2, 2.2 | `CredentialsProvider` with email + bcrypt password check against `users` table. Store in `src/lib/auth.ts`. **Must set `session: { strategy: "jwt" }`** in `authOptions` — do not use the Prisma DB adapter for sessions. `NEXTAUTH_SECRET` is the JWT signing key. |
| 3.2 | [x]    | Create `/api/auth/[...nextauth]/route.ts` handler      | 🔴       | 1      | 3.1      | App Router catch-all. Export `GET` and `POST` from NextAuth handler.                                                                                                                                                                                                |
| 3.3 | [x]    | Add `getServerSession` guard helper                    | 🟠       | 2      | 3.2      | Utility at `src/lib/session.ts`: wraps `getServerSession(authOptions)` and throws 401 if unauthenticated. Used by all API routes.                                                                                                                                   |
| 3.4 | [x]    | Create `AuthService.ts` (signUp with password hashing) | 🟠       | 2      | 3.3      | `src/services/AuthService.ts`. `signUp(email, password, name)` — hash with bcrypt, insert user. Handle duplicate email error.                                                                                                                                       |
| 3.5 | [x]    | `POST /api/auth/signup` route                          | 🟠       | 2      | 3.4      | Validates body with Zod, calls `AuthService.signUp`. Returns 201 on success, 409 on duplicate. Implemented at `/api/auth/users` (path differs from plan).                                                                                                           |
| 3.6 | [x]    | Basic login + signup page UI                           | 🔵       | 5      | 3.5      | Minimal form pages at `/login` and `/signup`. Not a design priority — functional only.                                                                                                                                                                              |

---

### 4. Core Node API

| #   | Status | Task                                                              | Priority | Points | Blockers      | Notes                                                                                                                                                                                                                                     |
| --- | ------ | ----------------------------------------------------------------- | -------- | ------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | [x]    | Write Zod schemas for Node request/response bodies                | 🔴       | 3      | 1.4           | `src/lib/schemas/node.schema.ts`. Schemas for create, update (partial), and each subtype's `data` payload.                                                                                                                                |
| 4.2 | [x]    | Create `NodeService.ts` skeleton                                  | 🔴       | 3      | 2.2           | `src/services/NodeService.ts`. Methods: `createNode`, `getNodeById`, `listNodes`, `updateNode`, `deleteNode`. Every read must JOIN `node_links` and populate `linkedNodeIds` on the returned object — it is never stored in `nodes.data`. |
| 4.3 | [x]    | `GET /api/nodes` — list all nodes for authenticated user          | 🔴       | 2      | 3.3, 4.1, 4.2 | Scoped to `userId` from session. Support optional `?type=` query param filter. Returns array of nodes.                                                                                                                                    |
| 4.4 | [x]    | `POST /api/nodes` — create a new node                             | 🔴       | 2      | 4.3           | Validates body with Zod. Generates `id` (UUID), sets `createdAt`/`updatedAt`. Returns 201 + created node.                                                                                                                                 |
| 4.5 | [x]    | `GET /api/nodes/[id]` — get a single node by ID                   | 🟠       | 1      | 4.3           | Returns 404 if not found or not owned by session user.                                                                                                                                                                                    |
| 4.6 | [x]    | `PATCH /api/nodes/[id]` — partial update a node                   | 🟠       | 2      | 4.5           | Merges `data` JSONB field (don't overwrite unrelated keys). Updates `updatedAt`. Returns updated node.                                                                                                                                    |
| 4.7 | [x]    | `DELETE /api/nodes/[id]` — soft delete (set `status = "deleted"`) | 🟠       | 1      | 4.5           | Does not remove the DB row. Returns 204 on success.                                                                                                                                                                                       |                                         |
| 4.8 | [ ]    | Link management endpoints (`POST`/`DELETE /api/nodes/[id]/links`) | 🟠       | 3      | 4.5      | Writes to/deletes from `node_links` table only — never touches `nodes.data`. `POST` body: `{ targetNodeId }`. Returns updated `linkedNodeIds` array derived from a fresh JOIN.                                                            |

---

## Phase Overview (Future Phases — Detail TBD)

> Expand the relevant section into a full task table when the current phase is complete.

### Phase 2 — Redux Store + Layout Shell

- Set up Redux store with slices: `nodesSlice`, `focusSlice`, `morning3Slice`, `dailyResetSlice`, `authSlice`
- Build single-panel layout: sidebar nav + main content area
- Task List view: renders Tasks, filterable by `energyLevel` (deep / light / quick)
- Node card component (Task / Event / Idea / Project variants)
- Connect Node API calls to Redux via RTK Query or `createAsyncThunk`

### Phase 3 — Morning 3, Inbox, Daily Reset

- **Morning 3:** on first open of the day, lock exactly 3 task picks; only those 3 shown prominently
- **Inbox / Idea Dump:** global quick-add (`Cmd+Shift+Space`); raw `Idea` Nodes land here; triage: convert to Task, schedule, or delete
- **Daily Reset:** on first open of a new day, surface each overdue task with Reschedule / Defer / Delete options; one at a time, < 20 sec per item
- Node conversion (Idea → Task preserving core metadata)

### Phase 4 — Focus Mode

- "Start" button on every task card
- Full-screen focus overlay: hides all other UI chrome
- Timer component: user sets countdown (any duration) or uses stopwatch mode
- `lastTouchedAt` and `actualDuration` updated per session via PATCH
- Smooth entry and exit transitions

### Phase 5 — Command Palette + Quick Add + NLP Entry

- Command palette powered by `cmdk`: `Cmd+K` or `/` opens it from any view
- All create / navigate / start actions accessible from palette
- Global quick-add shortcut (`Cmd+Shift+Space`) — captures to Inbox without navigation
- Rule-based NLP date/time parsing via `chrono-node` for natural language task/event entry

### Phase 6 — Calendar + Universal Search (v1.1)

- Calendar Day and Week views
- Drag any task to a time slot to set `dueDate` without changing type
- Universal search: full-text on `title`, `description`, `tags`; filter shortcuts (`energy:deep`, `due:today`)
- Google Calendar sync (OAuth, two-way Event sync)

### Phase 7 — Anti-Procrastination Suite (v2)

- **Task Shrinking:** after 30+ min idle on a large task → "Too big? Split it" prompt → inline task splitter
- **Why Are You Stuck?:** focus session stopped within 3 min → nudge with "unclear / scary / boring" choice
- **Micro Commitment:** "Just do 10 minutes" locked timer triggered from stuck flow
- `splitFromTaskId` linking for split tasks

### Phase 8 — AI Features (v1.1+)

- AI natural language entry: replace `chrono-node` rule parser with LLM parse layer
- Smart task/event field extraction from freeform text
- Browser extension for global capture (post-launch, scope TBD)
