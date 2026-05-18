# What is Ecosystem?

## Vision

Ecosystem is a **speed-first, anti-procrastination productivity app** — a single cloud application designed to get you working in seconds, not minutes. Where most apps keep you inside them by overwhelming you, Ecosystem's only job is to push you out and into the work. Fast capture, forced prioritization, and a ruthless focus on removing friction are the core product bets.

## Core Philosophy

**Get in. Start. Get out.**

Modern productivity tools fail because they optimize for engagement, not output. Ecosystem is the opposite: every screen, every interaction, every feature is designed to reduce the time between opening the app and doing the thing that matters.

**Context over categories.** Tasks are tagged by the energy they require — `deep`, `light`, or `quick` — not by project hierarchy. When you open the app you see what matches your current state, not a rigid folder tree.

**Forced prioritization beats unlimited lists.** Every morning you pick exactly 3 tasks. Not 10, not 20 — 3. The constraint is the feature.

**Everything is a Node.** A quick idea, a task with a deadline, and a calendar event all share a common base. This unified model enables frictionless conversion and universal search across all your data.

## What This App Does NOT Have

These features were deliberately excluded because they slow users down or encourage over-system-building:

- No sub-projects or project hierarchy (Area → Project nesting)
- No custom views or saved filters
- No recurring task templates
- No gamification, streaks, or points
- No kanban boards
- No color labels
- No priority levels (High / Medium / Low)

## Current Status

The project is in **early development** (v0.1). The core data models, authentication, and database foundation are built. The UI and all feature systems are planned but not yet implemented.

---

## Key Features

### 1. Morning 3

Every morning the app prompts: **"Pick 3 things."** The user selects exactly 3 tasks from their list. Only those 3 are shown prominently until they are done or the day resets. Everything else is hidden from the main view.

- Forces prioritization before the day starts
- Removes decision fatigue during the day
- If all 3 are done, the user may pick 1–3 more

### 2. Inbox (Idea Dump)

A frictionless capture zone — get the thought out of your head without interrupting what you are doing.

- One-tap / one-keystroke global quick add from anywhere in the app
- Raw `Idea` Nodes land here unprocessed
- Daily or on-demand triage: convert to Task, schedule, or discard

### 3. One-Tap Focus Start

Every task has a single **Start** button. Tapping it:

1. Closes / hides every other task from view
2. Expands the task to full screen
3. Pops up a timer (user sets any duration) or a stopwatch
4. Stays in focus mode until the user stops it or the timer ends

This is the app's single most important interaction.

### 4. Daily Reset

At the end of each day (or the start of the next), the app surfaces every incomplete task and asks — one at a time, exactly like Slack's "Slackbot remind me" decision flow:

- **Reschedule** → pick a new date
- **Defer** → push to "someday" with no date
- **Delete** → gone

Target: < 20 seconds per item. No guilt, just decisions.

### 5. Energy Context Tags

Tasks are not organized by project folder. They are tagged by the energy they require:

| Tag     | Meaning                                               |
| ------- | ----------------------------------------------------- |
| `deep`  | Requires focus and uninterrupted time (writing, code) |
| `light` | Low-stakes, can be done while tired (emails, admin)   |
| `quick` | Under 5 minutes (reply, file, check)                  |

When a user opens the app they can filter by their current energy state, not by an arbitrary project structure. Projects can still exist as simple flat groupings but are secondary to energy tags.

---

## Anti-Procrastination Features

### Task Shrinking

If a task has been sitting untouched for 30+ minutes during an active session, the app prompts: **"Too big? Split it."** Tapping yes opens an inline splitter that breaks the task into 2–5 smaller sub-tasks.

### Why Are You Stuck?

A gentle nudge when a task has been in "started" state for a while without the timer running:

> "Is this task **unclear, scary, or boring**?"

Each answer leads somewhere: Unclear → break it down. Scary → micro-commitment. Boring → quick-win framing.

### Micro Commitment

When a task feels insurmountable, the app offers: **"Just do 10 minutes."** This starts a locked 10-minute focus timer. No escape until the timer ends (with an opt-out for emergencies). Based on the foot-in-the-door psychological principle.

---

## Speed Features

### Natural Language Entry _(v1.1 with AI)_

Type naturally and the app parses it into structured data:

> "Meeting with John 2pm tomorrow" → creates an Event with `startTime` set

> "Email Sarah by Friday" → creates a Task with `dueDate` set

Implemented with an AI parse layer in v1.1. v1.0 ships a simple rule-based date parser.

### Command Palette

`Cmd+K` (or `/` from any view) opens a command palette — exactly like VS Code's. From here the user can:

- Create a task, idea, or event instantly
- Jump to any view
- Start a focus session on any task
- Run any action without touching the mouse

### Global Quick Add

A universal capture shortcut (default: `Cmd+Shift+Space`) pops up a minimal input overlay from anywhere in the app. Type the thought, hit Enter — it lands in the Inbox. No navigation required.

A browser extension for capturing from outside the app is planned post-launch.

### Smart Calendar

- Day and Week views (Month is available but de-emphasized)
- Drag any task to a time slot to schedule it without changing its type
- Two-way sync with Google Calendar and Apple Calendar (v1.1)

---

## Target User

People who know what they should be doing but can't make themselves start. Ecosystem is not for the over-organized — it is for the person who has tried every productivity system and found they spend more time maintaining the system than doing the work.

---

## Roadmap

| Version  | Key Deliverables                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------- |
| **v1.0** | Core Node engine, auth, Morning 3, Focus Start, Daily Reset, Inbox, Command Palette, Energy Tags      |
| **v1.1** | Natural language entry (AI), Google / Apple Calendar sync, Universal search                           |
| **v2.0** | Anti-procrastination suite (Task Shrinking, Stuck nudge, Micro Commitment), Browser extension capture |

> **Active sprint:** See `agent_docs/03-implementation_plan.md` for the current phase task backlog. That file is the starting point for every new coding session.

- Dragging a task across windows works seamlessly
- Converting an Idea to a Task retains all context
- Overdue task triage happens in < 30 seconds per item
