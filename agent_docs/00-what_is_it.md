# What is Ecosystem?

## Vision

Ecosystem is a **unified personal productivity and knowledge hub** — a single cloud application where every piece of your life (tasks, events, ideas, notes, projects) exists as an interconnected **Node**. Instead of bouncing between a calendar app, a todo list, a note-taker, and a project manager, everything lives in one intelligent workspace.

## Core Philosophy

**Everything is a Node.** A quick idea, a task with a deadline, a calendar event, and a complex project all share a common base. This unified model enables:

- **Frictionless conversion** — turn an Idea into a Task without losing context
- **Rich linking** — any Node can reference any other Node
- **Universal search** — find anything across all your data in one place
- **Time-aware scheduling** — drag any Node onto the calendar to schedule it without changing its type

## Current Status

The project is in **early development** (v0.1). The core data models (`Node`, `Task`, `Event`, `Idea`, `Project`) are defined. The windowed UI, calendar, and all services are planned but not yet implemented.

## Key Features

### 1. Windowed Workspace Interface

A floating-window desktop environment (inspired by macOS window management) where multiple panels can be open simultaneously:

- Calendar (Day / Week / Month / Year views)
- Dashboard (daily cockpit)
- Projects (area → project hierarchy)
- Inbox (triage center)
- Search

All windows support drag-and-drop between them.

### 2. Smart Calendar System

- Day, Week, Month, and Year views
- Drag-and-drop scheduling: dropping a Node onto a time slot sets its `dueDate` (Task) or `startTime` (Event) without converting its type
- Two-way sync with Google Calendar and Apple Calendar (v1.1)

### 3. Projects & Organization

- Hierarchical structure: **Area → Project → Nodes**
- Projects track `progress` (0–100, derived from child task completion), `startDate`, `targetDate`, and `projectStatus` (`active` / `paused` / `completed`)
- Filter any view to a specific project or area

### 4. Inbox / Triage Center

Handles two distinct workflows:

- **Overdue Task Triage** — for each overdue task, choose to Reschedule, Reassign, or Scrap
- **Brain Dump Processing** — hold unstructured ideas until categorized or converted to a typed Node

### 5. Dashboard

Time-aware daily cockpit:

- Today's tasks (ordered by priority)
- Overdue tasks (ordered by days overdue)
- Active/priority projects
- Upcoming deadlines (next 7–14 days)

Time windows adjust the default view: Inbox in the morning, Dashboard + projects during the day, reflection mode in the evening.

### 6. Node Conversion

Right-click any Node to convert it to another type. Core metadata (`id`, `title`, `description`, `tags`, `linkedNodeIds`) is preserved; type-specific fields are migrated or initialized with sensible defaults.

Example: `Idea → Task` carries over the title and description, sets `priority: 'medium'`, `completed: false`.

### 7. Universal Search

- Global omnibar (`Cmd+K` / `Cmd+/`)
- Full-text search across titles, descriptions, and tags
- Filter syntax: `type:task`, `project:"Q2 Launch"`, `due:today`
- Fuzzy matching with keyboard navigation

### 8. Brain Dump & AI Assistant _(v2+)_

- Scratch pad for text and photo uploads
- AI analyzes input in the background and non-intrusively offers to convert it into a structured Node
- Deferred to v2

### 9. User Accounts & Cloud Storage

- Email/password authentication with optional OAuth (Google, GitHub)
- All data stored in PostgreSQL, scoped to the authenticated user
- Accessible from any device

## Target User

Knowledge workers and creative professionals who want a single, unified system instead of juggling multiple apps. Ideal for anyone managing multiple projects, tracking ideas alongside deadlines, or frustrated by context-switching between tools.

## Roadmap

| Version  | Key Deliverables                                                          |
| -------- | ------------------------------------------------------------------------- |
| **v1.0** | Core Node engine, auth, windowed UI, calendar, dashboard, projects, inbox |
| **v1.1** | Universal search, Node conversion, Google / Apple Calendar sync           |
| **v2.0** | Brain Dump, AI assistant, habit tracking, wiki-style Node linking         |

> **Active sprint:** See `agent_docs/03-implementation_plan.md` for the current phase task backlog. That file is the starting point for every new coding session.

- Dragging a task across windows works seamlessly
- Converting an Idea to a Task retains all context
- Overdue task triage happens in < 30 seconds per item
