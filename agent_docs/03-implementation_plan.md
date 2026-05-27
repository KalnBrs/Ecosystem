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

## Current Phase: Phase 2 — Redux Store + Layout Shell

**Goal:** Stand up client-side app state and a usable application shell so authenticated users can view Nodes in the UI, filter Tasks by energy level, and trigger Node API operations through Redux-managed flows.

**Exit criteria:** All 🔴 and 🟠 tasks below are complete. The app renders a sidebar + main content layout, loads nodes via Redux async actions, shows Task cards, and supports energy-level filtering (`deep`, `light`, `quick`) from the UI.

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

## ~~Phase 1 Tasks~~ (Completed)

Phase 1 has been intentionally compressed to keep this file focused on active implementation work.

### Phase 1 Completion Snapshot

| Area                         | Status | Completion Notes                                                                                                              |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Project Setup & Dependencies | [x]    | Prisma + Postgres client, NextAuth, Redux Toolkit/react-redux, and Zod installed; env templates and dev Postgres configured.  |
| Database Foundation          | [x]    | Prisma schema and migrations complete for `users`, `nodes`, `node_links`; seed script and schema verification complete.       |
| Authentication               | [x]    | NextAuth credentials flow, auth route, session guard helper, signup service/route, and basic login/signup pages are complete. |
| Core Node API                | [x]    | Full authenticated Node CRUD + link management endpoints complete and tested against DB-backed services.                      |

**Exit criteria met:** authenticated API CRUD on `/api/nodes` with persisted PostgreSQL data, plus link management and signup/auth flows.

---

## Phase 2 Tasks

### 1. Redux State Foundation

| #   | Status | Task                                                               | Priority | Points | Blockers | Notes                                                                                                                          |
| --- | ------ | ------------------------------------------------------------------ | -------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | [x]    | Create app Redux store scaffold                                    | 🔴       | 2      | None     | Add `src/store/store.ts` with `configureStore`, typed `RootState`/`AppDispatch`, and thunk support.                            |
| 1.2 | [x]    | Add client `StoreProvider` and wire in root layout                 | 🔴       | 2      | 1.1      | Create `src/store/StoreProvider.tsx` using `<Provider store={store}>`; wrap app content in provider from app layout.           |
| 1.3 | [x]    | Implement `authSlice` for session status and current user metadata | 🟠       | 3      | 1.1      | Track `status` (`idle/loading/authenticated/unauthenticated`), user basics (`id`, `email`, `name`), and auth errors.           |
| 1.4 | [x]    | Implement `nodesSlice` with normalized node state                  | 🔴       | 5      | 1.1      | Store nodes by `id` + ordered id list. Include request status/error and selectors for all nodes, by type, and by id.           |
| 1.5 | [x]    | Implement `focusSlice` state model                                 | 🟠       | 2      | 1.1      | Keep `activeTaskId`, focus mode flag, timer mode (`countdown`/`stopwatch`), and duration fields for upcoming focus-mode phase. |
| 1.6 | [ ]    | Implement `morning3Slice` state model                              | 🟠       | 2      | 1.1      | Track selected task ids, lock state, and `lastInitializedDate` for first-open-of-day behavior in next phase.                   |
| 1.7 | [ ]    | Implement `dailyResetSlice` state model                            | 🟠       | 2      | 1.1      | Track overdue queue ids, index pointer, and reset completion date for daily reset workflow in next phase.                      |

### 2. API Wiring Through Redux

| #   | Status | Task                                                             | Priority | Points | Blockers | Notes                                                                                                                                                                         |
| --- | ------ | ---------------------------------------------------------------- | -------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | [ ]    | Create Node API client module for frontend data access           | 🔴       | 3      | 4.8      | Add `src/store/api/nodesApi.ts` with helpers for list/get/create/update/delete/link/unlink using existing `/api/nodes` endpoints.                                             |
| 2.2 | [ ]    | Add async thunks for node fetch + mutations                      | 🔴       | 5      | 2.1, 1.4 | Implement thunks (`fetchNodes`, `createNodeThunk`, `updateNodeThunk`, `deleteNodeThunk`, `createLinkThunk`, `deleteLinkThunk`) and integrate with `nodesSlice.extraReducers`. |
| 2.3 | [ ]    | Add consistent loading and error handling across node operations | 🟠       | 2      | 2.2      | Standardize pending/fulfilled/rejected handling and expose user-friendly error state for UI.                                                                                  |
| 2.4 | [ ]    | Add typed selector helpers for task filtering                    | 🟠       | 2      | 2.2      | Selector set should cover: all tasks, active tasks only, and tasks by `energyLevel`.                                                                                          |

### 3. Layout Shell + Task List UI

| #   | Status | Task                                                    | Priority | Points | Blockers | Notes                                                                                                                                                       |
| --- | ------ | ------------------------------------------------------- | -------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | [ ]    | Build single-panel application shell                    | 🔴       | 5      | 1.2      | Implement sidebar navigation + main content region with responsive behavior in `src/app/page.tsx` (or routed dashboard page), preserving current auth flow. |
| 3.2 | [ ]    | Create reusable `NodeCard` component with type variants | 🟠       | 5      | 3.1      | Add `src/components/NodeCard.tsx` with visual/state variants for Task/Event/Idea/Project, driven by node `type`.                                            |
| 3.3 | [ ]    | Build Task List view with energy filter controls        | 🔴       | 3      | 3.1, 2.4 | Render Task cards and filter toggles/chips for `deep`, `light`, `quick`, plus `all`.                                                                        |
| 3.4 | [ ]    | Wire Task List to Redux node selectors and thunks       | 🔴       | 3      | 3.3, 2.2 | Fetch nodes on initial load, derive task view from selectors, and render loading/empty/error states.                                                        |
| 3.5 | [ ]    | Add basic node action handlers from cards               | 🟠       | 3      | 3.2, 2.2 | At minimum: archive/delete and quick status toggles where applicable, routed through Redux thunks to existing API endpoints.                                |

### 4. Validation & Tests

| #   | Status | Task                                                              | Priority | Points | Blockers                | Notes                                                                     |
| --- | ------ | ----------------------------------------------------------------- | -------- | ------ | ----------------------- | ------------------------------------------------------------------------- |
| 4.1 | [ ]    | Add reducer/unit tests for new slices                             | 🟠       | 3      | 1.3, 1.4, 1.5, 1.6, 1.7 | Cover initial state + key transitions for each slice.                     |
| 4.2 | [ ]    | Add selector tests for task energy filtering                      | 🟠       | 2      | 2.4                     | Validate filtering behavior for mixed node sets and empty states.         |
| 4.3 | [ ]    | Add UI tests for Task List loading, empty, and filtered rendering | 🟠       | 3      | 3.4                     | Use existing test setup style under `src/__tests__`.                      |
| 4.4 | [ ]    | Phase 2 integration smoke test (`login -> load nodes -> filter`)  | 🔵       | 2      | 4.3                     | Lightweight manual QA checklist acceptable if full e2e is not set up yet. |

---

## Phase Overview (Future Phases — Detail TBD)

> Expand the relevant section into a full task table when the current phase is complete.

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
