# Phase 1 — Section 4: Core Node API — Changes Summary

## Overview

This section implemented the complete CRUD API surface for the `Node` resource, along with the service layer, request/response validation schemas, and link management endpoints. All routes are protected by a JWT session guard and scoped to the authenticated user.

---

## 4.1 — Zod Schemas (`src/lib/schemas/node.schema.ts`)

Created a comprehensive validation layer for all node operations.

- Defined a shared `BaseNode` schema (title, description, userId, status, tags) that all node subtypes extend.
- Defined **create schemas** for each subtype — `TaskSchema`, `EventSchema`, `IdeaSchema`, `ProjectSchema` — each with a `type` discriminant literal and a strongly typed `data` object validated by Zod.
- Defined **partial update schemas** (`UpdateTaskSchema`, `UpdateEventSchema`, etc.) where all base fields and `data` sub-fields are optional, enabling safe partial PATCH operations.
- Exported a `CreateNodeSchema` discriminated union (via `z.discriminatedUnion("type", [...])`) and a matching `UpdateNodeSchema`.
- Exported inferred TypeScript types `CreateNodeInput` and `UpdateNodeInput` for use across the service and route layers.

---

## 4.2 — Node Service (`src/services/NodeService.ts`)

Created the primary data-access service between the API routes and Prisma.

- Defined a shared `nodeLinksInclude` Prisma include config that JOINs both `outgoingLinks` and `incomingLinks` on every read — ensuring `linkedNodeIds` is always derived from live database relations, never stored in `nodes.data`.
- Implemented a `hydrateNode()` function that maps a raw Prisma row (with joined link arrays) into the correct typed model class (`Task`, `Event`, `Idea`, or `Project`).
- Implemented the following service methods:
  - `createNode(input)` — inserts a new node row and returns the hydrated model.
  - `getNodeById(id, userId)` — fetches a single node scoped to the session user; returns `null` on miss.
  - `listNodes(userId, type)` — returns all non-deleted nodes for a user, with an optional `?type=` filter, ordered newest-first.
  - `updateNode(id, userId, input)` — merges the incoming `data` JSONB patch over the existing stored object (non-destructive), updates scalar fields, returns the updated node or `null` if not found.
  - `deleteNode(id, userId)` — soft-deletes by setting `status = "deleted"` rather than removing the row; returns a boolean indicating success.
  - `createLink(sourceNodeId, targetNodeId, userId)` — verifies the caller owns the source node, then upserts a row into `node_links`; returns the refreshed link arrays.
  - `deleteLink(sourceNodeId, targetNodeId, userId)` — verifies ownership, deletes the matching `node_links` row, and returns the updated link arrays.

---

## 4.3 — `GET /api/nodes` (`src/app/api/nodes/route.ts`)

- Requires a valid session; returns 401 if missing.
- Reads an optional `?type=` query parameter and passes it to `listNodes`.
- Returns `200` with `{ message, data: Node[] }`.

---

## 4.4 — `POST /api/nodes` (`src/app/api/nodes/route.ts`)

- Requires a valid session; returns 401 if missing.
- Parses and validates the request body with `CreateNodeSchema`; Zod throws on invalid input.
- Calls `createNode()` and returns `201` with the newly created node.

---

## 4.5 — `GET /api/nodes/[id]` (`src/app/api/nodes/[id]/route.ts`)

- Requires a valid session; returns 401 if missing.
- Calls `getNodeById(id, userId)` — ownership is enforced at the query level.
- Returns `404` if the node does not exist or belongs to another user; `200` with node data otherwise.

---

## 4.6 — `PATCH /api/nodes/[id]` (`src/app/api/nodes/[id]/route.ts`)

- Requires a valid session; returns 401 if missing.
- Validates the body with `UpdateNodeSchema` (all fields optional).
- Calls `updateNode()`, which merges the `data` JSONB field non-destructively (only provided keys are overwritten).
- Returns `404` if not found, `200` with the updated node on success.

---

## 4.7 — `DELETE /api/nodes/[id]` (`src/app/api/nodes/[id]/route.ts`)

- Requires a valid session; returns 401 if missing.
- Calls `deleteNode()`, which sets `status = "deleted"` — the database row is preserved.
- Returns `404` if the node is not found, `204 No Content` on successful soft-delete.

---

## 4.8 — Link Management (`src/app/api/nodes/[id]/links/route.ts`)

- Defined a minimal `LinkBodySchema` (`{ targetNodeId: z.uuid() }`) inline for request validation.
- `POST /api/nodes/[id]/links` — creates a directional link from the path `id` (source) to `targetNodeId` in the body. Returns `201` with the updated `{ outgoingIds, incomingIds }` arrays.
- `DELETE /api/nodes/[id]/links` — removes the link between the same two nodes. Returns `200` with the updated link arrays.
- Both endpoints enforce session auth and ownership of the source node; return `404` if the source node is not found or not owned by the caller. Link data is always derived from a fresh database JOIN — it is never written into `nodes.data`.

---

## Files Changed / Created

| File | Action |
|---|---|
| `src/lib/schemas/node.schema.ts` | Created |
| `src/services/NodeService.ts` | Created |
| `src/app/api/nodes/route.ts` | Created |
| `src/app/api/nodes/[id]/route.ts` | Created |
| `src/app/api/nodes/[id]/links/route.ts` | Created |
