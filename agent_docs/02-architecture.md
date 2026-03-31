# Architecture & System Design

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend (React 19 + Next.js 16)               │
│                  (TypeScript + Tailwind CSS v4)                  │
├────────────────┬────────────────┬────────────────┬──────────────┤
│   Calendar     │   Dashboard    │   Projects     │   Inbox  ... │
├─────────────────────────────────────────────────────────────────┤
│              Window Manager (Floating Windows)                   │
├─────────────────────────────────────────────────────────────────┤
│            Redux Store (Global Application State)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    nodes     │  │   windows    │  │     auth     │  ...     │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│               REST API Layer (Next.js API Routes)               │
│   /api/nodes   /api/projects   /api/search   /api/auth  ...    │
├─────────────────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)                    │
│   nodes   projects   node_links   users   sessions              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model: The Node System

### Implementation Note

The TypeScript models in `src/lib/models/` use **class inheritance** — every Node subtype extends the base `Node` class and exposes its type-specific fields as direct constructor parameters. This is the source of truth for the shape of data in the application.

The PostgreSQL schema stores type-specific fields in a `JSONB data` column (see [Database Schema](#database-schema-overview)). The service layer is responsible for serializing class instances to/from that column.

---

### Base Node (`src/lib/models/Node.ts`)

```typescript
export type NodeType = "task" | "event" | "project" | "note" | "idea" | "custom"
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
    public linkedNodeIds: string[],
    public status: NodeStatus,
  ) {}
}
```

---

### Node Subtypes

#### Task (`src/lib/models/Task.ts`)

```typescript
export class Task extends Node {
  constructor(
    // base Node fields...
    public dueDate?: Date,
    public priority: "low" | "medium" | "high" = "medium",
    public completed: boolean = false,
    public recurrenceRule?: RecurrenceRule,
    public estimatedDuration?: number,   // minutes
    public actualDuration?: number,      // minutes
    public projectId?: string
  )
}
```

#### Event (`src/lib/models/Event.ts`)

```typescript
export class Event extends Node {
  constructor(
    // base Node fields...
    public startTime: Date,
    public endTime: Date,
    public isAllDay: boolean = false,
    public location?: string,
    public recurrenceRule?: RecurrenceRule
  )
}
```

> Note: `reminders` and `externalCalendarId` are not yet implemented — planned for v1.1 calendar sync.

#### Idea (`src/lib/models/Idea.ts`)

```typescript
export class Idea extends Node {
  constructor(
    // base Node fields...
    public content: string,   // rich text body
    public pinned: boolean = false
  )
}
```

#### Project (`src/lib/models/Project.ts`)

```typescript
export class Project extends Node {
  constructor(
    // base Node fields...
    public startDate?: Date,
    public targetDate?: Date,
    public projectStatus: "active" | "paused" | "completed" = "active",
    public progress: number = 0,          // 0–100, derived from child task completion
    public childNodeIds: string[] = []
  )
}
```

> Note: `area` (e.g., "Work", "Personal") is stored as a `tag` or separate `area` field — TBD during DB schema finalization.

#### RecurrenceRule (`src/@types/RecurrenceRule.ts`)

```typescript
export type Frequency = "daily" | "weekly" | "monthly" | "yearly"

export interface RecurrenceRule {
  frequency: Frequency
  interval: number // e.g., 2 = every 2 weeks
  daysOfWeek?: number[] // 0 (Sun) – 6 (Sat), for weekly recurrence
  dayOfMonth?: number // 1–31, for monthly recurrence
  endDate?: Date
  count?: number // total occurrences
}
```

---

## Core Systems & Modules

### 1. Window Manager System _(planned)_

**Responsibility:** Manage floating windows — positions, sizes, z-order, lifecycle

**Components:**

- `WindowManager` — Central coordinator; renders all active windows
- `Window` — Individual floating window wrapper (title bar, resize handles)
- `WindowResizeHandle`, `WindowDragHandle`

**Redux State:**

```typescript
{
  windows: {
    [windowId: string]: {
      id: string
      type: "calendar" | "dashboard" | "projects" | "inbox" | "search" | "brain-dump"
      position: { x: number; y: number }
      size: { width: number; height: number }
      isVisible: boolean
      zIndex: number
    }
  }
}
```

**Behavior:**

- Drag by title bar, resize by edges/corners
- Optional snap-to-grid
- Time-aware defaults: morning → Inbox first; rest of day → Dashboard
- Layout persists within a session; resets at midnight

**File location:** `src/components/WindowManager/`

---

### 2. Node Engine & Conversion System _(planned)_

**Responsibility:** CRUD and type conversion for all Nodes

**Service:** `src/services/NodeService.ts`

| Method                     | Description                        |
| -------------------------- | ---------------------------------- |
| `createNode(type, data)`   | Instantiate and persist a new Node |
| `updateNode(id, data)`     | Partial update                     |
| `deleteNode(id)`           | Soft delete (`status = "deleted"`) |
| `convertNode(id, newType)` | Transform one subtype to another   |
| `linkNodes(id1, id2)`      | Bidirectional link between Nodes   |
| `searchNodes(query)`       | Full-text search                   |

**Conversion contract:** `id`, `title`, `description`, `userId`, `tags`, `linkedNodeIds` are always preserved. Type-specific fields are migrated where applicable; missing required fields get sensible defaults.

```
Idea → Task
  Preserved:    id, title, description, tags, linkedNodeIds
  Discarded:    content, pinned
  Initialized:  priority = "medium", completed = false, dueDate = undefined
```

**File location:** `src/services/NodeService.ts`, `src/lib/models/`

---

### 3. Calendar System _(planned)_

**Responsibility:** Display and manipulate Nodes by time

**Views:** Day (24h timeline), Week (7-day grid), Month, Year

**Components:**

- `Calendar`, `CalendarDay`, `CalendarWeek`, `CalendarMonth`, `CalendarYear`
- `CalendarEvent` — draggable Node card
- `CalendarGrid` — underlying grid structure

**Drag-and-drop rules:**

- Dragging any Node to a time slot updates `dueDate` (Task) or `startTime` / `endTime` (Event)
- Does NOT change the Node's type
- Dragging from Calendar to another window moves/copies the Node reference

**Redux State:**

```typescript
{
  calendar: {
    currentDate: Date
    viewType: "day" | "week" | "month" | "year"
    selectedDateRange: [Date, Date]
  }
}
```

**File location:** `src/components/Calendar/`, `src/services/CalendarService.ts`

---

### 4. Dashboard System _(planned)_

**Responsibility:** Time-aware daily cockpit

**Sections:**

1. Today's Tasks — ordered by priority
2. Overdue Tasks — ordered by days overdue
3. Active Projects — `projectStatus === "active"`
4. Upcoming Deadlines — next 7–14 days
5. Habit Tracker _(v2+)_

**Time windows:**

| Time         | Default view                      |
| ------------ | --------------------------------- |
| 8 AM – 12 PM | Inbox + Agenda                    |
| 12 PM – 6 PM | Dashboard + Active Projects       |
| 6 PM – 8 AM  | Reflection mode + Tomorrow's prep |

Layout resets at midnight.

**File location:** `src/components/Dashboard/`, `src/services/DashboardService.ts`

---

### 5. Projects & Organization System _(planned)_

**Responsibility:** Organize Nodes by project and area hierarchy

**Hierarchy:**

```
Area: "Work"
  └── Project: "Q2 Product Launch"
        ├── Task: "Design mockups"
        ├── Event: "Kickoff meeting"
        └── Idea: "New feature concept"

Area: "Personal"
  └── Project: "Home Renovation"
```

Projects track `progress` (0–100) derived from `childNodeIds` task completion.

**File location:** `src/components/Projects/`, `src/services/ProjectService.ts`

---

### 6. Inbox / Triage System _(planned)_

**Two modes:**

**A. Overdue Task Triage**

- Lists all Tasks where `dueDate < now && !completed`
- Per-task actions: Reschedule (pick new date), Reassign _(v2)_, Scrap (soft delete)
- Target: < 30 seconds per item

**B. Brain Dump Processing**

- Raw Idea Nodes pinned or awaiting categorization
- v2: AI suggests Node type and target project

**File location:** `src/components/Inbox/`, `src/services/InboxService.ts`

---

### 7. Universal Search System _(planned, v1.1)_

**Features:**

- Global omnibar (`Cmd+K` / `Cmd+/`)
- Full-text search on `title`, `description`, `tags`
- Fuzzy matching, keyboard navigation
- Filter syntax: `type:task`, `project:"Q2 Launch"`, `status:overdue`, `due:today`

**File location:** `src/components/Search/`, `src/services/SearchService.ts`

---

### 8. Authentication & User Management _(planned)_

**Stack:** NextAuth.js — email/password + OAuth (Google, GitHub)

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

### 9. External Calendar Sync _(planned, v1.1)_

- One-time OAuth for Google Calendar
- Two-way sync for Events and due-dated Tasks
- Webhook handlers to pull external changes back into Ecosystem
- `externalCalendarId` field will be added to `Event` in v1.1

**File location:** `src/services/CalendarSyncService.ts`

---

### 10. Brain Dump & AI Assistant _(v2+)_

**Workflow:**

1. User inputs freeform text or uploads a photo
2. AI runs in background (non-blocking)
3. "Magic wand" button appears if structure is detected
4. User accepts → Node is created and placed in the correct project
5. User rejects → kept as raw pinned Idea

**File location:** `src/components/BrainDump/`, `src/services/AIService.ts`

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
                CHECK (type IN ('task', 'event', 'idea', 'note', 'project', 'custom')),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50) DEFAULT 'active'
                CHECK (status IN ('active', 'archived', 'deleted')),
  data        JSONB,                  -- type-specific fields (serialized from class)
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_user_id   ON nodes(user_id);
CREATE INDEX idx_nodes_type      ON nodes(type);
CREATE INDEX idx_nodes_status    ON nodes(status);
CREATE INDEX idx_nodes_data      ON nodes USING gin(data);  -- JSONB index
CREATE INDEX idx_nodes_created   ON nodes(created_at);
```

### `projects`

```sql
CREATE TABLE projects (
  id             UUID PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  area           VARCHAR(100),        -- e.g., 'Work', 'Personal'
  color          VARCHAR(7),          -- hex color for UI
  project_status VARCHAR(50) DEFAULT 'active',
  start_date     TIMESTAMP,
  target_date    TIMESTAMP,
  progress       SMALLINT DEFAULT 0,  -- 0–100
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
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

### `sessions`

```sql
CREATE TABLE sessions (
  id         UUID PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

## File Structure

```
ecosystem/
├── src/
│   ├── @types/
│   │   ├── index.ts               ← re-exports all custom types
│   │   └── RecurrenceRule.ts      ✅ implemented
│   │
│   ├── app/
│   │   ├── layout.tsx             ✅
│   │   ├── page.tsx               ✅
│   │   └── api/                   ⏸️ empty — all routes planned
│   │       ├── auth/              (login, signup, logout)
│   │       ├── nodes/             (CRUD + convert)
│   │       ├── projects/
│   │       ├── search/
│   │       └── calendar-sync/     (google, apple)
│   │
│   ├── components/                ⏸️ planned
│   │   ├── WindowManager/
│   │   ├── Calendar/
│   │   ├── Dashboard/
│   │   ├── Projects/
│   │   ├── Inbox/
│   │   ├── Search/
│   │   ├── BrainDump/
│   │   └── Common/                (Button, Input, Modal)
│   │
│   ├── lib/
│   │   ├── models/                ✅ implemented
│   │   │   ├── Node.ts
│   │   │   ├── Task.ts
│   │   │   ├── Event.ts
│   │   │   ├── Idea.ts
│   │   │   ├── Project.ts
│   │   │   └── index.ts
│   │   └── utils/                 ⏸️ planned
│   │       ├── dateUtils.ts
│   │       ├── nodeUtils.ts
│   │       └── storageUtils.ts
│   │
│   ├── services/                  ⏸️ planned
│   │   ├── NodeService.ts
│   │   ├── ProjectService.ts
│   │   ├── CalendarService.ts
│   │   ├── CalendarSyncService.ts
│   │   ├── SearchService.ts
│   │   ├── AuthService.ts
│   │   ├── DashboardService.ts
│   │   └── AIService.ts           (v2+)
│   │
│   ├── redux/                     ⏸️ planned
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── nodesSlice.ts
│   │       ├── windowsSlice.ts
│   │       ├── authSlice.ts
│   │       ├── calendarSlice.ts
│   │       └── searchSlice.ts
│   │
│   ├── middleware/                ⏸️ planned
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   │
│   └── styles/
│       └── globals.css            ✅
│
├── prisma/
│   └── schema.prisma              ⏸️ not yet created
│
├── public/
├── eslint.config.mjs              ✅
├── next.config.ts                 ✅
├── tsconfig.json                  ✅
└── package.json                   ✅
```

---

## Data Flow Examples

### Creating a Task

```
User submits Create Task form
  → Redux action: nodesSlice.createNode({ type: "task", ... })
  → NodeService.createNode()
  → POST /api/nodes
  → Prisma INSERT into nodes (type-specific fields → data JSONB)
  → Redux state updated
  → Calendar / Dashboard / Projects re-render
```

### Dragging a Task to the Calendar

```
User drags Task card to a Calendar time slot
  → WindowManager detects cross-window drop
  → Calendar resolves target date/time from drop position
  → Redux action: nodesSlice.updateNode({ id, dueDate: newDate })
  → PATCH /api/nodes/[id]
  → Prisma UPDATE nodes SET data['dueDate'] = ...
  → Redux state updated
  → Both windows re-render
```

### Converting an Idea to a Task

```
User right-clicks Idea → "Convert to Task"
  → NodeService.convertNode(ideaId, "task")
  → Preserve: id, title, description, userId, tags, linkedNodeIds
  → Discard: content, pinned
  → Initialize: priority = "medium", completed = false
  → POST /api/nodes/convert
  → Prisma UPDATE nodes SET type = "task", data = { priority, completed, ... }
  → Redux state updated
  → All views show the Node as a Task
```

---

## Phase Breakdown

| Phase       | Scope       | Key Deliverables                                             |
| ----------- | ----------- | ------------------------------------------------------------ |
| **Phase 1** | Weeks 1–6   | Node engine, DB schema, auth, Window Manager, basic Calendar |
| **Phase 2** | Weeks 7–10  | Dashboard, Projects view, Inbox / Triage, Redux store        |
| **Phase 3** | Weeks 11–14 | Node Conversion, cross-window Drag-and-Drop, copy/paste      |
| **Phase 4** | Weeks 15–18 | Universal Search, Google / Apple Calendar sync (v1.1)        |
| **Phase 5** | TBD (v2.0)  | Brain Dump, AI assistant, habit tracking, wiki-style linking |
