# Architecture & System Design

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend (React 19 + Next.js 16)               │
│                  (TypeScript + Tailwind CSS v4)                  │
├──────────┬──────────┬──────────┬──────────┬────────────────────┤
│ Morning3 │  Inbox   │ TaskList │ Calendar │  Focus Mode   ...  │
├─────────────────────────────────────────────────────────────────┤
│          Single-Panel Layout with Sidebar Navigation            │
├─────────────────────────────────────────────────────────────────┤
│            Redux Store (Global Application State)               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  nodes   │  │  focus   │  │  morning3  │  │    auth     │  │
│  └──────────┘  └──────────┘  └────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│               REST API Layer (Next.js API Routes)               │
│   /api/nodes   /api/focus   /api/morning3   /api/auth  ...     │
├─────────────────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)                    │
│   nodes   node_links   users                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model: The Node System

### Implementation Note

The TypeScript models in `src/lib/models/` use **class inheritance** — every Node subtype extends the base `Node` class and exposes its type-specific fields as direct constructor parameters. This is the source of truth for the shape of data in the application.

The PostgreSQL schema stores type-specific fields in a `JSONB data` column (see [Database Schema](#database-schema-overview)). The service layer is responsible for serializing class instances to/from that column.

**`linkedNodeIds` — Option A (derived from `node_links`):** `linkedNodeIds` on the `Node` class is a **computed field**. It is never stored in `nodes.data`. On every read, `NodeService` JOINs the `node_links` table and populates `linkedNodeIds` in-memory. The `node_links` join table is the single source of truth for all link relationships. This gives referential integrity (FK + `ON DELETE CASCADE`), prevents orphaned IDs, and enables efficient reverse-link queries (`idx_node_links_target`).

---

### Base Node (`src/lib/models/Node.ts`)

```typescript
export type NodeType = "task" | "event" | "idea" | "project"

export type NodeStatus = "active" | "archived" | "deleted"

export class Node {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public type: NodeType,
    public createdAt: Date,
    public updatedAt: Date,
    public userId: string,
    public tags: string[],
    /** Derived at read time from node_links — never stored in nodes.data */
    public linkedNodeIds: string[],
    public status: NodeStatus,
  ) {}
}
```

> **Removed from v1:** `color` (color labels removed from product). `note`, `area`, and `custom` Node types are also removed.

---

### Node Subtypes

#### Task (`src/lib/models/Task.ts`)

```typescript
export type EnergyLevel = "deep" | "light" | "quick"

export class Task extends Node {
  constructor(
    // base Node fields...
    public completed: boolean = false,
    public dueDate?: Date,
    public energyLevel?: EnergyLevel, // deep / light / quick — replaces priority
    public isMorningPick: boolean = false, // true if selected in today's Morning 3
    public lastTouchedAt?: Date, // updated on any edit or focus session start
    public estimatedDuration?: number, // minutes
    public actualDuration?: number, // minutes — accumulated across focus sessions
    public projectId?: string, // optional flat project grouping
    public splitFromTaskId?: string, // set when created via "Too big? Split it"
  ) {}
}
```

> **Removed from v1:** `priority` (High/Medium/Low), `recurrenceRule` (recurring task templates).

#### Event (`src/lib/models/Event.ts`)

```typescript
export class Event extends Node {
  constructor(
    // base Node fields...
    public startTime: Date,
    public endTime: Date,
    public isAllDay: boolean = false,
    public location?: string,
  ) {}
}
```

> **Removed from v1:** `recurrenceRule`. `externalCalendarId` is not yet implemented — planned for v1.1 calendar sync.

#### Idea (`src/lib/models/Idea.ts`)

```typescript
export class Idea extends Node {
  constructor(
    // base Node fields...
    public content: string, // rich text body
    public pinned: boolean = false,
  ) {}
}
```

#### Project (`src/lib/models/Project.ts`)

A Project is a **flat, optional container** for Tasks and Events. There is no nesting, no sub-projects, and no Area parent layer. Tasks do not need to belong to a project.

```typescript
export class Project extends Node {
  constructor(
    // base Node fields...
    public startDate?: Date,
    public targetDate?: Date,
    public projectStatus: "active" | "paused" | "completed" = "active",
    public progress: number = 0, // 0–100, derived from child task completion
    public childNodeIds: string[] = [], // flat list of Task/Event IDs
  ) {}
}
```

> **Removed from v1:** `Area` type and Area → Project hierarchy. Projects are now flat and optional.

---

### Removed Types

| Removed                                  | Reason                                           |
| ---------------------------------------- | ------------------------------------------------ |
| `Area`                                   | No project hierarchy — projects are flat         |
| `RecurrenceRule`                         | No recurring templates                           |
| `priority` on Task                       | Replaced by `energyLevel` (deep / light / quick) |
| `color` on Node                          | Color labels removed from product                |
| `recurrenceRule` on Task/Event           | No recurring templates in v1                     |
| `NodeType: "note"`, `"area"`, `"custom"` | Simplified type set                              |

---

## Core Systems & Modules

### 1. Morning 3 System _(planned)_

**Responsibility:** Force daily prioritization to exactly 3 tasks.

**Flow:**

1. On first app open of the day (after midnight reset), show the Morning 3 screen
2. User sees their full task list, filterable by energy level or project
3. User taps exactly 3 tasks — these are marked `isMorningPick: true`
4. All other tasks collapse off the main view for the day
5. If all 3 are completed, the user may pick 1–3 more

**Redux State:**

```typescript
{
  morning3: {
    picksLockedForDate: string | null   // ISO date "2026-05-17"
    pickedTaskIds: string[]             // exactly 3 when complete
    selectionComplete: boolean
  }
}
```

**API:** `GET /api/morning3` returns today's picks. `POST /api/morning3` saves the 3 selected task IDs.

**File location:** `src/components/Morning3/`, `src/services/Morning3Service.ts`

---

### 2. Focus Mode System _(planned)_

**Responsibility:** One-tap deep work on a single task, eliminating all distractions.

**Flow:**

1. User taps "Start" on any task
2. All other tasks and UI chrome collapse — only the focused task fills the screen
3. A timer UI appears: user sets a custom countdown or uses a stopwatch
4. `lastTouchedAt` is updated on the Task; `actualDuration` accumulates per session
5. When the timer ends or the user stops: summary shown, task status updated
6. App returns to normal view

**Redux State:**

```typescript
{
  focus: {
    activeTaskId: string | null
    mode: "timer" | "stopwatch" | null
    timerDurationMinutes: number | null
    startedAt: string | null // ISO timestamp
    elapsedSeconds: number
    isRunning: boolean
  }
}
```

**Anti-procrastination hooks:**

- After 30+ min with `isRunning: false` on a large task → trigger "Too big? Split it"
- Timer started then stopped within 3 min → trigger "Why are you stuck?" nudge

**File location:** `src/components/FocusMode/`

---

### 3. Daily Reset System _(planned)_

**Responsibility:** Clear incomplete tasks each day with a fast, guilt-free decision flow.

**Trigger:** On first app open of a new day (when `lastResetDate !== today`).

**Flow (one task at a time):**

For each Task where `dueDate < today && !completed`:

> **"[Task Title]"**
> [Reschedule] [Defer] [Delete]

- **Reschedule** → date picker, sets new `dueDate`
- **Defer** → clears `dueDate`, task stays undated
- **Delete** → soft-delete (`status = "deleted"`)

Target: < 20 seconds per item.

**Redux State:**

```typescript
{
  dailyReset: {
    isActive: boolean
    pendingTaskIds: string[]
    currentIndex: number
  }
}
```

**File location:** `src/components/DailyReset/`

---

### 4. Inbox / Idea Dump System _(planned)_

**Responsibility:** Frictionless capture of raw thoughts.

- Raw `Idea` Nodes land here with no required fields beyond `title`
- Accessible via sidebar, Command Palette, or the global quick-add shortcut (`Cmd+Shift+Space`)
- Triage: convert `Idea → Task`, schedule it, or delete
- No AI processing in v1 — raw capture and manual triage only

**File location:** `src/components/Inbox/`, `src/services/InboxService.ts`

---

### 5. Command Palette _(planned)_

**Responsibility:** Keyboard-driven access to every action from anywhere in the app.

**Trigger:** `Cmd+K` or `/` from any view

**Powered by:** `cmdk` (headless command palette)

| Command             | Action                                 |
| ------------------- | -------------------------------------- |
| `New task`          | Open quick-create task input           |
| `New idea`          | Add to Inbox                           |
| `New event`         | Open event creator                     |
| `Start [task name]` | Begin focus session on a specific task |
| `Go to Morning 3`   | Navigate to Morning 3 view             |
| `Go to Inbox`       | Navigate to Inbox                      |
| `Go to Calendar`    | Navigate to Calendar                   |
| `Daily reset`       | Trigger daily reset flow manually      |
| `Search...`         | Full-text search across all Nodes      |

**File location:** `src/components/CommandPalette/`

---

### 6. Anti-Procrastination Features _(planned, v2)_

These behavioural interventions are not blocking for v1 but the Task model supports them from the start (`lastTouchedAt`, `splitFromTaskId`).

#### Task Shrinking

- Condition: task open for 30+ min with `isRunning: false`
- Prompt: **"Too big? Split it."**
- Creates 2–5 child tasks; `splitFromTaskId` is set on each

#### Why Are You Stuck?

- Condition: focus session started then stopped within 3 minutes
- Prompt: **"Is this task unclear, scary, or boring?"**
- Each answer branches to a micro-action

#### Micro Commitment

- Trigger: user answers "scary" or "boring" in the stuck flow
- Prompt: **"Just do 10 minutes."**
- Starts a locked 10-minute focus session

**File location:** `src/components/FocusMode/AntiProcrastination/`

---

### 7. Energy Context Tags

Tasks use `energyLevel: "deep" | "light" | "quick"` instead of priority levels. The task list filters by energy level so users match work to their current state.

| Energy  | When to use                                |
| ------- | ------------------------------------------ |
| `deep`  | Focus blocks (coding, writing, analysis)   |
| `light` | Low-effort (emails, admin, reviewing)      |
| `quick` | Under 5 minutes (reply, file, quick check) |

`energyLevel` is optional — tasks without it appear in all energy filters.

---

### 8. Calendar System _(planned)_

**Responsibility:** Display and schedule Nodes by time.

**Views:** Day (24h timeline), Week (7-day grid), Month (available, de-emphasized)

**Drag-and-drop rules:**

- Dragging a Task to a time slot updates `dueDate` without changing its type
- Dragging an Idea to a slot converts it to a Task and sets `dueDate`

**File location:** `src/components/Calendar/`, `src/services/CalendarService.ts`

---

### 9. Natural Language Entry _(planned, v1.1)_

**v1.0:** Rule-based date/time parsing with `chrono-node`.

> "Email Sarah by Friday" → Task with `dueDate = this Friday`
> "Meeting with John 2pm tomorrow" → Event with `startTime = tomorrow 14:00`

**v1.1:** AI parse layer replaces the rule-based parser. Same input/output contract.

**File location:** `src/lib/utils/nlpEntry.ts`

---

### 10. Node Engine & Conversion System _(planned)_

**Service:** `src/services/NodeService.ts`

| Method                     | Description                        |
| -------------------------- | ---------------------------------- |
| `createNode(type, data)`   | Instantiate and persist a new Node |
| `updateNode(id, data)`     | Partial update                     |
| `deleteNode(id)`           | Soft delete (`status = "deleted"`) |
| `convertNode(id, newType)` | Transform one subtype to another   |
| `linkNodes(id1, id2)`      | Bidirectional link between Nodes   |
| `searchNodes(query)`       | Full-text search                   |

**Conversion contract:** `id`, `title`, `description`, `userId`, `tags`, `linkedNodeIds` always preserved.

```
Idea → Task
  Preserved:    id, title, description, tags, linkedNodeIds
  Discarded:    content, pinned
  Initialized:  completed = false, dueDate = undefined
```

---

### 11. Universal Search _(planned, v1.1)_

- Full-text search on `title`, `description`, `tags`
- Accessible from Command Palette
- Filter shortcuts: `type:task`, `energy:deep`, `due:today`

**File location:** `src/components/Search/`, `src/services/SearchService.ts`

---

### 12. Authentication & User Management

**Stack:** NextAuth.js — email/password + optional OAuth (Google, GitHub)

**Session Strategy: JWT (stateless)**
`session: { strategy: "jwt" }` — sessions stored in a signed `HttpOnly` cookie using `NEXTAUTH_SECRET`. No database `sessions` table needed.

**Redux State:**

```typescript
{
  auth: {
    user: { id: string; email: string; name: string } | null
    isAuthenticated: boolean
  }
}
```

**File location:** `src/services/AuthService.ts`, `src/app/api/auth/`

---

### 13. External Calendar Sync _(planned, v1.1)_

- One-time OAuth for Google Calendar
- Two-way sync for Events and due-dated Tasks
- `externalCalendarId` field will be added to `Event` in v1.1

---

---

## Database Schema Overview

### `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name          VARCHAR(255),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### `nodes`

```sql
CREATE TABLE nodes (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL
                CHECK (type IN ('task', 'event', 'idea', 'project')),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50) DEFAULT 'active'
                CHECK (status IN ('active', 'archived', 'deleted')),
  tags        TEXT[] DEFAULT '{}',    -- mirrors Node.tags string[]
  data        JSONB,                  -- type-specific fields (serialized from class)
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_user_id   ON nodes(user_id);
CREATE INDEX idx_nodes_type      ON nodes(type);
CREATE INDEX idx_nodes_status    ON nodes(status);
CREATE INDEX idx_nodes_tags      ON nodes USING gin(tags);
CREATE INDEX idx_nodes_data      ON nodes USING gin(data);
CREATE INDEX idx_nodes_created   ON nodes(created_at);
```

**Task `data` JSONB shape:**

```json
{
  "completed": false,
  "dueDate": "2026-05-20T14:00:00Z",
  "energyLevel": "deep",
  "isMorningPick": false,
  "lastTouchedAt": "2026-05-17T09:00:00Z",
  "estimatedDuration": 45,
  "actualDuration": 0,
  "projectId": "uuid-or-null",
  "splitFromTaskId": "uuid-or-null"
}
```

**Event `data` JSONB shape:**

```json
{
  "startTime": "2026-05-20T14:00:00Z",
  "endTime": "2026-05-20T15:00:00Z",
  "isAllDay": false,
  "location": "Conference Room B"
}
```

**Idea `data` JSONB shape:**

```json
{
  "content": "Raw idea text or rich text",
  "pinned": false
}
```

**Project `data` JSONB shape:**

```json
{
  "startDate": "2026-05-01",
  "targetDate": "2026-06-01",
  "projectStatus": "active",
  "progress": 0,
  "childNodeIds": ["uuid1", "uuid2"]
}
```

### `node_links`

```sql
CREATE TABLE node_links (
  id             UUID PRIMARY KEY,
  source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (source_node_id, target_node_id)
);

CREATE INDEX idx_node_links_source ON node_links(source_node_id);
CREATE INDEX idx_node_links_target ON node_links(target_node_id);
```

### `sessions` — not used

> **NextAuth JWT strategy is in use.** Sessions are stored in a signed `HttpOnly` cookie — no `sessions` table is created or needed.

---

## File Structure

```
ecosystem/
├── src/
│   ├── @types/
│   │   └── index.ts               ✅ re-exports all custom types
│   │
│   ├── app/
│   │   ├── layout.tsx             ✅
│   │   ├── page.tsx               ✅
│   │   └── api/
│   │       ├── auth/              ✅ login, signup, logout
│   │       ├── nodes/             ⏸️ CRUD + convert
│   │       ├── morning3/          ⏸️ daily picks
│   │       └── calendar-sync/     ⏸️ Google/Apple (v1.1)
│   │
│   ├── components/                ⏸️ planned
│   │   ├── Morning3/              morning pick selection screen
│   │   ├── FocusMode/             full-screen focus + timer
│   │   │   └── AntiProcrastination/ stuck prompts, micro-commitment (v2)
│   │   ├── DailyReset/            end-of-day triage flow
│   │   ├── Inbox/                 idea dump + triage
│   │   ├── CommandPalette/        cmdk-powered command palette
│   │   ├── Calendar/              day / week views
│   │   ├── TaskList/              energy-filtered task list
│   │   └── Common/                Button, Input, Modal, Timer
│   │
│   ├── lib/
│   │   ├── models/                ✅ implemented
│   │   │   ├── Node.ts
│   │   │   ├── Task.ts
│   │   │   ├── Event.ts
│   │   │   ├── Idea.ts
│   │   │   ├── Project.ts
│   │   │   └── index.ts
│   │   ├── schemas/               ✅ Zod schemas
│   │   │   └── node.schema.ts
│   │   └── utils/                 ⏸️ planned
│   │       ├── dateUtils.ts
│   │       ├── nlpEntry.ts        NLP → structured Node (chrono-node v1.0, AI v1.1)
│   │       └── nodeUtils.ts
│   │
│   ├── services/
│   │   ├── AuthService.ts         ✅
│   │   ├── NodeService.ts         ⏸️ planned
│   │   ├── Morning3Service.ts     ⏸️ planned
│   │   ├── InboxService.ts        ⏸️ planned
│   │   ├── CalendarService.ts     ⏸️ planned
│   │   └── SearchService.ts       ⏸️ planned (v1.1)
│   │
│   ├── redux/                     ⏸️ planned
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── nodesSlice.ts
│   │       ├── focusSlice.ts
│   │       ├── morning3Slice.ts
│   │       ├── dailyResetSlice.ts
│   │       └── authSlice.ts
│   │
│   └── styles/
│       └── globals.css            ✅
│
├── prisma/
│   ├── schema.prisma              ✅
│   └── seed.ts                    ✅
│
├── public/
├── eslint.config.mjs              ✅
├── next.config.ts                 ✅
├── tsconfig.json                  ✅
└── package.json                   ✅
```

---

## Data Flow Examples

### Starting a Focus Session

```
User taps "Start" on a Task card
  → Redux action: focusSlice.startFocus({ taskId, mode: "timer", duration: 25 })
  → FocusMode component mounts full-screen overlay
  → NodeService.updateNode({ id, lastTouchedAt: now })
  → PATCH /api/nodes/[id]
  → Timer runs client-side; no server round-trips during the session
  → On stop: PATCH /api/nodes/[id] with { actualDuration: += elapsed }
  → Redux focusSlice resets; normal view restores
```

### Morning 3 Selection

```
User opens app after midnight
  → Daily reset check: if lastResetDate !== today → show DailyReset flow first
  → After reset (or skip) → show Morning3 selection screen
  → User taps 3 tasks
  → POST /api/morning3 { taskIds: [id1, id2, id3], date: "2026-05-17" }
  → NodeService.updateNode x3: isMorningPick = true, clear previous picks
  → Redux morning3Slice updated
  → Main view shows only Morning 3 tasks prominently
```

### Daily Reset

```
User opens app on a new day
  → API: GET /api/nodes?filter=overdue&completed=false
  → DailyReset component shows first overdue task
  → User taps "Reschedule" → date picker → PATCH /api/nodes/[id] { dueDate: newDate }
  → User taps "Delete" → PATCH /api/nodes/[id] { status: "deleted" }
  → When queue empty → mark reset done → proceed to Morning 3
```

### Converting an Idea to a Task

```
User taps "Convert to Task" on an Idea in Inbox
  → NodeService.convertNode(ideaId, "task")
  → Preserve: id, title, description, userId, tags, linkedNodeIds
  → Discard: content, pinned
  → Initialize: completed = false, dueDate = undefined
  → PUT /api/nodes/convert
  → Redux state updated
  → Node appears in Task List; removed from Inbox
```

---

## Phase Breakdown

| Phase       | Key Deliverables                                                                |
| ----------- | ------------------------------------------------------------------------------- |
| **Phase 1** | Node engine, DB schema, auth ✅ (in progress)                                   |
| **Phase 2** | Redux store, single-panel layout shell, sidebar nav, Task List + energy filter  |
| **Phase 3** | Morning 3 flow, Inbox (idea dump + triage), Daily Reset triage                  |
| **Phase 4** | Focus Mode (Start button, full-screen, timer/stopwatch), Node conversion        |
| **Phase 5** | Command Palette (`cmdk`), global quick-add shortcut, NLP date parsing           |
| **Phase 6** | Calendar (Day/Week views, drag-to-schedule), Universal Search (v1.1)            |
| **Phase 7** | Anti-procrastination suite (Task Shrinking, Stuck nudge, Micro Commitment) (v2) |
| **Phase 8** | AI natural language entry, Google/Apple Calendar sync (v1.1+)                   |
