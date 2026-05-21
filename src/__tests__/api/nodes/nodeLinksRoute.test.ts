/**
 * POST /api/nodes/[id]/links and DELETE /api/nodes/[id]/links — route tests
 *
 * Verifies the HTTP behavior of the node-link management routes.
 * next-auth (getServerSession) and NodeService are mocked.
 *
 * POST /api/nodes/[id]/links
 *   Input:  session + id param + { targetNodeId: UUID } body
 *   201  — link created; returns { outgoingIds, incomingIds }
 *   401  — unauthenticated
 *   404  — source node not found / not owned by user
 *   500  — invalid body or service throws
 *
 * DELETE /api/nodes/[id]/links
 *   Input:  session + id param + { targetNodeId: UUID } body
 *   200  — link removed; returns { outgoingIds, incomingIds }
 *   401  — unauthenticated
 *   404  — source node not found / not owned by user
 *   500  — invalid body or service throws
 */

import { POST, DELETE } from "@/app/api/nodes/[id]/links/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));

jest.mock("@/services/NodeService", () => ({
  createLink: jest.fn(),
  deleteLink: jest.fn(),
}));

// ─── Mock accessors ───────────────────────────────────────────────────────────

import { getServerSession } from "next-auth/next";
import { createLink, deleteLink } from "@/services/NodeService";

const sessionMock = getServerSession as jest.Mock;
const createLinkMock = createLink as jest.Mock;
const deleteLinkMock = deleteLink as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const SOURCE_ID = "550e8400-e29b-41d4-a716-446655440002";
const TARGET_ID = "550e8400-e29b-41d4-a716-446655440003";

const AUTHED_SESSION = { user: { id: USER_ID } };

/** Wraps params as a Promise to match App Router handler signature. */
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body?: unknown, method = "POST"): Request {
  return new Request(`http://localhost/api/nodes/${SOURCE_ID}/links`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ─── POST /api/nodes/[id]/links ───────────────────────────────────────────────

describe("POST /api/nodes/[id]/links", () => {
  describe("when authenticated and source node is owned by the user", () => {
    it("responds 201 with outgoingIds and incomingIds", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createLinkMock.mockResolvedValue({
        outgoingIds: [TARGET_ID],
        incomingIds: [],
      });

      const response = await POST(
        makeRequest({ targetNodeId: TARGET_ID }),
        makeParams(SOURCE_ID),
      );
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data.outgoingIds).toContain(TARGET_ID);
      expect(Array.isArray(body.data.incomingIds)).toBe(true);
    });

    it("calls createLink with (sourceId, targetId, userId)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createLinkMock.mockResolvedValue({ outgoingIds: [TARGET_ID], incomingIds: [] });

      await POST(makeRequest({ targetNodeId: TARGET_ID }), makeParams(SOURCE_ID));

      expect(createLinkMock).toHaveBeenCalledWith(SOURCE_ID, TARGET_ID, USER_ID);
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const response = await POST(
        makeRequest({ targetNodeId: TARGET_ID }),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(401);
      expect(createLinkMock).not.toHaveBeenCalled();
    });
  });

  describe("when the source node does not belong to the user", () => {
    it("responds 404", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createLinkMock.mockResolvedValue(null);

      const response = await POST(
        makeRequest({ targetNodeId: TARGET_ID }),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(404);
    });
  });

  describe("with an invalid body", () => {
    it("responds 500 when targetNodeId is not a UUID (Zod throws)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const response = await POST(
        makeRequest({ targetNodeId: "not-a-uuid" }),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(500);
      expect(createLinkMock).not.toHaveBeenCalled();
    });

    it("responds 500 when targetNodeId is missing", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const response = await POST(makeRequest({}), makeParams(SOURCE_ID));

      expect(response.status).toBe(500);
    });
  });

  describe("when createLink throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createLinkMock.mockRejectedValue(new Error("DB error"));

      const response = await POST(
        makeRequest({ targetNodeId: TARGET_ID }),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(500);
    });
  });
});

// ─── DELETE /api/nodes/[id]/links ─────────────────────────────────────────────

describe("DELETE /api/nodes/[id]/links", () => {
  describe("when authenticated and source node is owned by the user", () => {
    it("responds 200 with updated outgoingIds and incomingIds", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteLinkMock.mockResolvedValue({ outgoingIds: [], incomingIds: [] });

      const response = await DELETE(
        makeRequest({ targetNodeId: TARGET_ID }, "DELETE"),
        makeParams(SOURCE_ID),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data.outgoingIds)).toBe(true);
      expect(body.data.outgoingIds).not.toContain(TARGET_ID);
    });

    it("calls deleteLink with (sourceId, targetId, userId)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteLinkMock.mockResolvedValue({ outgoingIds: [], incomingIds: [] });

      await DELETE(makeRequest({ targetNodeId: TARGET_ID }, "DELETE"), makeParams(SOURCE_ID));

      expect(deleteLinkMock).toHaveBeenCalledWith(SOURCE_ID, TARGET_ID, USER_ID);
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const response = await DELETE(
        makeRequest({ targetNodeId: TARGET_ID }, "DELETE"),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(401);
      expect(deleteLinkMock).not.toHaveBeenCalled();
    });
  });

  describe("when the source node does not belong to the user", () => {
    it("responds 404", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteLinkMock.mockResolvedValue(null);

      const response = await DELETE(
        makeRequest({ targetNodeId: TARGET_ID }, "DELETE"),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(404);
    });
  });

  describe("with an invalid body", () => {
    it("responds 500 when targetNodeId is not a UUID (Zod throws)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const response = await DELETE(
        makeRequest({ targetNodeId: "not-a-uuid" }, "DELETE"),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(500);
      expect(deleteLinkMock).not.toHaveBeenCalled();
    });
  });

  describe("when deleteLink throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteLinkMock.mockRejectedValue(new Error("DB error"));

      const response = await DELETE(
        makeRequest({ targetNodeId: TARGET_ID }, "DELETE"),
        makeParams(SOURCE_ID),
      );

      expect(response.status).toBe(500);
    });
  });
});
