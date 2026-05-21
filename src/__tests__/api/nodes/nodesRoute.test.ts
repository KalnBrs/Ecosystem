/**
 * GET /api/nodes and POST /api/nodes — route tests
 *
 * Verifies the HTTP behavior of the node collection routes.
 * next-auth (getServerSession) and NodeService are mocked.
 *
 * GET /api/nodes
 *   Input:  authenticated session; optional ?type= query param
 *   201    200 — returns array of nodes
 *   401    — unauthenticated
 *   500    — service throws
 *
 * POST /api/nodes
 *   Input:  authenticated session; valid CreateNode JSON body
 *   201    201 — returns created node
 *   401    — unauthenticated
 *   500    — invalid body or service throws
 */

import { GET, POST } from "@/app/api/nodes/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));

jest.mock("@/services/NodeService", () => ({
  listNodes: jest.fn(),
  createNode: jest.fn(),
}));

// ─── Mock accessors ───────────────────────────────────────────────────────────

import { getServerSession } from "next-auth/next";
import { listNodes, createNode } from "@/services/NodeService";

const sessionMock = getServerSession as jest.Mock;
const listNodesMock = listNodes as jest.Mock;
const createNodeMock = createNode as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const NODE_ID = "550e8400-e29b-41d4-a716-446655440002";

const AUTHED_SESSION = { user: { id: USER_ID } };

/** A minimal hydrated task node returned by the service layer. */
const stubTaskNode = {
  id: NODE_ID,
  type: "task",
  title: "Write tests",
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

function makeRequest(url: string, options?: RequestInit): Request {
  return new Request(url, options);
}

// ─── GET /api/nodes ───────────────────────────────────────────────────────────

describe("GET /api/nodes", () => {
  describe("when authenticated", () => {
    it("responds 200 with the list of nodes", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      listNodesMock.mockResolvedValue([stubTaskNode]);

      const request = makeRequest("http://localhost/api/nodes");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].id).toBe(NODE_ID);
    });

    it("calls listNodes with the authenticated userId", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      listNodesMock.mockResolvedValue([]);

      const request = makeRequest("http://localhost/api/nodes");
      await GET(request);

      expect(listNodesMock).toHaveBeenCalledWith(USER_ID, null);
    });

    it("passes the type query param to listNodes", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      listNodesMock.mockResolvedValue([]);

      const request = makeRequest("http://localhost/api/nodes?type=task");
      await GET(request);

      expect(listNodesMock).toHaveBeenCalledWith(USER_ID, "task");
    });

    it("passes null as type when no query param is provided", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      listNodesMock.mockResolvedValue([]);

      const request = makeRequest("http://localhost/api/nodes");
      await GET(request);

      expect(listNodesMock).toHaveBeenCalledWith(USER_ID, null);
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const request = makeRequest("http://localhost/api/nodes");
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(listNodesMock).not.toHaveBeenCalled();
    });
  });

  describe("when listNodes throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      listNodesMock.mockRejectedValue(new Error("DB unavailable"));

      const request = makeRequest("http://localhost/api/nodes");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});

// ─── POST /api/nodes ──────────────────────────────────────────────────────────

describe("POST /api/nodes", () => {
  const validTaskBody = {
    type: "task",
    title: "New Task",
    userId: USER_ID,
    status: "active",
    tags: [],
    data: { completed: false, actualDuration: 0 },
  };

  describe("when authenticated with a valid body", () => {
    it("responds 201 with the created node", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createNodeMock.mockResolvedValue({ ...stubTaskNode, title: "New Task" });

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validTaskBody),
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data).toBeDefined();
      expect(body.data.title).toBe("New Task");
    });

    it("calls createNode with the parsed body", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createNodeMock.mockResolvedValue(stubTaskNode);

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validTaskBody),
      });
      await POST(request);

      expect(createNodeMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "task", title: "New Task" }),
      );
    });
  });

  describe("when unauthenticated", () => {
    it("responds 401", async () => {
      sessionMock.mockResolvedValue(null);

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validTaskBody),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(createNodeMock).not.toHaveBeenCalled();
    });
  });

  describe("with an invalid request body", () => {
    it("responds 500 when required fields are missing (Zod throws)", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "task" }), // missing title, userId, status, data
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(createNodeMock).not.toHaveBeenCalled();
    });

    it("responds 500 when type is an unknown discriminant", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "unknown", title: "x", userId: USER_ID, status: "active" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("when createNode throws", () => {
    it("responds 500", async () => {
      sessionMock.mockResolvedValue(AUTHED_SESSION);
      createNodeMock.mockRejectedValue(new Error("DB error"));

      const request = makeRequest("http://localhost/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validTaskBody),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
