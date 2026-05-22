# Tech Stack & Development Tools

## Overview

Ecosystem is a **full-stack cloud application** built with modern web technologies, prioritizing scalability, type safety, and developer experience. This document distinguishes between what is already installed/implemented and what is planned.

---

## Currently Installed Dependencies

From `package.json` as of v0.1:

```json
"dependencies": {
  "next": "16.1.6",
  "react": "19.2.3",
  "react-dom": "19.2.3"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "babel-plugin-react-compiler": "1.0.0",
  "eslint": "^9",
  "eslint-config-next": "16.1.6",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

Everything else below is **planned** unless marked ✅ installed.

---

## Frontend Stack

### Core Framework

- **Next.js 16.1.6** ✅ — App Router, collocated API routes, server + client components
- **React 19.2.3** ✅ — React Compiler (`babel-plugin-react-compiler`) enabled for automatic memoization optimization
- **TypeScript 5** ✅ — Strict mode; custom type definitions in `src/@types/`

### Styling

- **Tailwind CSS v4** ✅ — Utility-first, configured via `postcss.config.mjs`
- **Component libraries** _(planned, not yet selected)_ — Candidates: shadcn/ui, Radix UI, Headless UI. Will be paired with handcrafted components for the windowed interface.

### State Management _(planned)_

- **Redux Toolkit** — Primary choice. Will manage:
  - All Node data (tasks, events, ideas)
  - Auth state
  - UI state (active view, focus session, Morning 3 picks, command palette open/closed)
- **Fallback:** Zustand if Redux proves too heavy for the use case

### Layout _(planned)_

Single-panel, sidebar-driven layout. No floating windows. The app has one primary content area that transitions between views:

| View            | Route / Trigger                  |
| --------------- | -------------------------------- |
| Morning 3       | Default on first open of the day |
| Focus Mode      | Triggered by "Start" button      |
| Inbox           | Sidebar nav or `Cmd+K`           |
| Task List       | Sidebar nav or `Cmd+K`           |
| Calendar        | Sidebar nav or `Cmd+K`           |
| Daily Reset     | End-of-day prompt                |
| Command Palette | `Cmd+K` / `/` from any view      |

### Command Palette _(planned)_

- **`cmdk`** — Headless command palette primitive (used by shadcn/ui). Lightweight, accessible, keyboard-driven.
- Triggered globally by `Cmd+K`
- Hosts all actions: create task/idea/event, navigate views, start focus session

---

## Backend Stack

### API Layer _(planned)_

- **Next.js API Routes** — Collocated at `src/app/api/`. No separate backend server needed.
- REST endpoints for nodes, projects, auth, search, and calendar sync

### Authentication _(planned)_

- **NextAuth.js** — Email/password + optional OAuth (Google, GitHub)
- Features: sign-up, login, password reset, session management across windows

### Database _(planned)_

- **PostgreSQL** — Primary data store
- **Prisma ORM** — Type-safe queries, schema-first migrations, JSONB support

#### Data Storage Approach

The TypeScript models (`src/lib/models/`) use **class inheritance** with direct typed fields. The database schema mirrors this with a **relational + JSONB hybrid**:

- Core Node fields (`id`, `user_id`, `type`, `title`, `status`, etc.) in relational columns
- Type-specific fields stored in a `data JSONB` column

This means the ORM layer will serialize/deserialize class instances to/from the `data` column. See `02-architecture.md` for the full schema.

**Database hosting candidates:** Supabase, Neon, Railway, AWS RDS (managed preferred to avoid DevOps overhead)

---

## Development Tools

### Linting & Code Quality

- **ESLint 9** ✅ — Configured via `eslint.config.mjs` with Next.js recommended rules

### Environment Variables _(convention, not yet configured)_

| File              | Purpose                   |
| ----------------- | ------------------------- |
| `.env.local`      | Local development secrets |
| `.env.production` | Production secrets        |

Variables needed: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, OAuth client IDs

### Local Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # Run ESLint
```

### Database (once Prisma is added)

```bash
npx prisma migrate dev --name <name>   # Create and apply migration
npx prisma studio                      # Visual DB browser
```

### Version Control

- GitHub, feature branches, conventional commits

### Deployment _(planned)_

- **Vercel** — Native Next.js hosting, serverless API routes, automatic git deploys
- **Alternative:** Self-hosted on AWS / DigitalOcean / Railway

---

## Future Decisions

### AI Service _(v1.1, not yet decided)_

Candidates: OpenAI GPT-4, Anthropic Claude, Azure AI  
Usage: Natural language task/event entry parsing (v1.1). Later: stuck-detection analysis, task splitting suggestions.

v1.0 ships a lightweight rule-based date/time parser (chrono-node or similar) for basic NLP entry without AI costs.

### External Calendar Sync _(v1.1)_

- Google Calendar API — two-way sync via OAuth
- Apple Calendar / iCloud — strategy TBD, requires separate OAuth flow

---

## Summary Table

| Layer              | Technology                    | Status            | Notes                          |
| ------------------ | ----------------------------- | ----------------- | ------------------------------ |
| Frontend framework | Next.js 16.1.6 + React 19.2.3 | ✅ Installed      | App Router                     |
| Language           | TypeScript 5 (strict)         | ✅ Installed      | `src/@types/` for custom types |
| Styling            | Tailwind CSS v4               | ✅ Installed      | PostCSS configured             |
| React Compiler     | `babel-plugin-react-compiler` | ✅ Installed      | Auto-optimization              |
| Component library  | shadcn/ui + Radix UI          | ⏸️ Planned        | Pairs with `cmdk` for palette  |
| Command palette    | `cmdk`                        | ⏸️ Planned        | `Cmd+K` global trigger         |
| State management   | Redux Toolkit                 | ⏸️ Planned        | Zustand as fallback            |
| Layout             | Single-panel sidebar nav      | ⏸️ Planned        | No floating windows            |
| NLP date parsing   | `chrono-node` (v1.0)          | ⏸️ Planned        | Rule-based; AI upgrade in v1.1 |
| API layer          | Next.js API Routes            | ⏸️ Planned        | `src/app/api/` (empty)         |
| Auth               | NextAuth.js                   | ✅ Installed      | Email + JWT sessions           |
| Database           | PostgreSQL + Prisma           | ✅ Installed      | JSONB hybrid schema            |
| Deployment         | Vercel                        | ⏸️ Planned        | Serverless                     |
| AI service         | TBD                           | ⏸️ Future (v1.1+) | NLP entry, stuck detection     |
