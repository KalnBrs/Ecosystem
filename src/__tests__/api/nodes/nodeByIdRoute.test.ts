/**
 * GET /api/nodes/[id], PATCH /api/nodes/[id], DELETE /api/nodes/[id] — route tests
 *
 * Verifies the HTTP behavior of the single-node routes.
 * next-auth (getServerSession) and NodeService are mocked.
 *
 * GET /api/nodes/[id]
 *   Input:  session + id param
 *   200  — node found
 *   401  — unauthenticated
 *   404  — node not found
 *   500  — service throws
 *
 * PATCH /api/nodes/[id]
 *   Input:  session + id param + partial update body
 *   200  — node updated; returns updated node
 *   401  — unauthenticated
 *   404  — node not found
 *   500  — invalid body or service throws
 *
 * DELETE /api/nodes/[id]
 *   Input:  session + id param
 *   204  — node soft-deleted
 *   401  — unauthenticated
 *   404  — node not found
 *   500  — service throws
 */

import { GET, PATCH, DELETE } from "@/app/api/nodes/[id]/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));

jest.mock("@/services/NodeService", () => ({
  getNodeById: jest.fn(),
  updateNode: jest.fn(),
  deleteNode: jest.fn(),
}));

// ─── Mock accessors ───────────────────────────────────────────────────────────

import { getServerSession } from "next-auth/next";
import { getNodeById, updateNode, deleteNode } from "@/services/NodeService";

const sessionMock = getServerSession as jest.Mock;
const getNodeByIdMock = getNodeById as jest.Mock;
const updateNodeMock = updateNode as jest.Mock;
const deleteNodeMock = deleteNode as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const NODE_ID = "550e8400-e29b-41d4-a716-446655440002";

const AUTHED_SESSION = { user: { id: USER_ID } };

const stubNode = {
  id: NODE_ID,
  type: "task",
  title: "My Task",
  description: "",
  userId: USER_ID,
  status: "active",
  tags: [],
  outgoingLinkedNodeIds: [],
  incomingLinkedNodeIds: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  completed: false,
  actualDuration: 0,
};

/** Builds the params context object to match App Router handler signature. */
function makeParams(id: string) {
  return { params: { id } };
}

function makeRequest(options?: RequestInit): Request {
  return new Request(`http://localhost/api/nodes/${NODE_ID}`, options);
}

// ─── GET /api/nodes/[id] ──────────────────────────────────────────────────────

describe("GET /api/nodes/[id]", () => {
  describe("when authenticated and node exists", () => {
    it("responds 200 with the node data", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      getNodeByIdMock.mockResolvedValue(stubNode);

      const response = await GET(makeRequest(), makeParams(NODE_ID));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(NODE_ID);
    });

    it("calls getNodeById with the correct id and userId", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      getNodeByIdMock.mockResolvedValue(stubNode);

      await GET(makeRequest(), makeParams(NODE_ID));

      expect(getNodeByIdMock).toHaveBeenCalledWith(NODE_ID, USER_ID);
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const response = await GET(makeRequest(), makeParams(NODE_ID));

      expect(response.status).toBe(401);
      expect(getNodeByIdMock).not.toHaveBeenCalled();
    });
  });

  describe("when the node does not exist for the user", () => {
    it("responds 404", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      getNodeByIdMock.mockResolvedValue(null);

      const response = await GET(makeRequest(), makeParams(NODE_ID));

      expect(response.status).toBe(404);
    });
  });

  describe("when getNodeById throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      getNodeByIdMock.mockRejectedValue(new Error("DB error"));

      const response = await GET(makeRequest(), makeParams(NODE_ID));

      expect(response.status).toBe(500);
    });
  });
});

// ─── PATCH /api/nodes/[id] ────────────────────────────────────────────────────

describe("PATCH /api/nodes/[id]", () => {
  const validPatchBody = { type: "task", title: "Updated Title" };

  describe("when authenticated and node exists", () => {
    it("responds 200 with the updated node", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      updateNodeMock.mockResolvedValue({ ...stubNode, title: "Updated Title" });

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPatchBody),
      });
      const response = await PATCH(request, makeParams(NODE_ID));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.title).toBe("Updated Title");
    });

    it("calls updateNode with the correct id, userId, and parsed input", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      updateNodeMock.mockResolvedValue(stubNode);

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPatchBody),
      });
      await PATCH(request, makeParams(NODE_ID));

      expect(updateNodeMock).toHaveBeenCalledWith(
        NODE_ID,
        USER_ID,
        expect.objectContaining({ type: "task", title: "Updated Title" }),
      );
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPatchBody),
      });
      const response = await PATCH(request, makeParams(NODE_ID));

      expect(response.status).toBe(401);
      expect(updateNodeMock).not.toHaveBeenCalled();
    });
  });

  describe("when the node does not exist for the user", () => {
    it("responds 404", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      updateNodeMock.mockResolvedValue(null);

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPatchBody),
      });
      const response = await PATCH(request, makeParams(NODE_ID));

      expect(response.status).toBe(404);
    });
  });

  describe("with an invalid request body", () => {
    it("responds 500 when the type discriminant is missing (Zod throws)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "No type" }),
      });
      const response = await PATCH(request, makeParams(NODE_ID));

      expect(response.status).toBe(400);
    });
  });

  describe("when updateNode throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      updateNodeMock.mockRejectedValue(new Error("DB error"));

      const request = makeRequest({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPatchBody),
      });
      const response = await PATCH(request, makeParams(NODE_ID));

      expect(response.status).toBe(500);
    });
  });
});

// ─── DELETE /api/nodes/[id] ───────────────────────────────────────────────────

describe("DELETE /api/nodes/[id]", () => {
  describe("when authenticated and node exists", () => {
    it("responds 204", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteNodeMock.mockResolvedValue(true);

      const response = await DELETE(makeRequest({ method: "DELETE" }), makeParams(NODE_ID));

      expect(response.status).toBe(204);
    });

    it("calls deleteNode with the correct id and userId", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteNodeMock.mockResolvedValue(true);

      await DELETE(makeRequest({ method: "DELETE" }), makeParams(NODE_ID));

      expect(deleteNodeMock).toHaveBeenCalledWith(NODE_ID, USER_ID);
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const response = await DELETE(makeRequest({ method: "DELETE" }), makeParams(NODE_ID));

      expect(response.status).toBe(401);
      expect(deleteNodeMock).not.toHaveBeenCalled();
    });
  });

  describe("when deleteNode throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      deleteNodeMock.mockRejectedValue(new Error("DB error"));

      const response = await DELETE(makeRequest({ method: "DELETE" }), makeParams(NODE_ID));

      expect(response.status).toBe(500);
    });
  });
});
