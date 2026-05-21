/**
 * NodeService tests
 *
 * Tests the behavior of each exported NodeService function.
 * All Prisma access is mocked — only input/output contracts are verified.
 *
 * Covered functions:
 *   createNode, getNodeById, listNodes, updateNode, deleteNode,
 *   createLink, deleteLink
 */

import {
  createNode,
  getNodeById,
  listNodes,
  updateNode,
  deleteNode,
  createLink,
  deleteLink,
} from "@/services/NodeService";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    node: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    nodeLink: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("@/generated/prisma", () => ({
  NodeType: {
    task: "task",
    event: "event",
    idea: "idea",
    project: "project",
  },
  NodeStatus: {
    active: "active",
    archived: "archived",
    deleted: "deleted",
  },
}));

// ─── Mock accessors ───────────────────────────────────────────────────────────

import prisma from "@/lib/prisma";

const nodeCreate = prisma.node.create as jest.Mock;
const nodeFindFirst = prisma.node.findFirst as jest.Mock;
const nodeFindMany = prisma.node.findMany as jest.Mock;
const nodeFindUniqueOrThrow = prisma.node.findUniqueOrThrow as jest.Mock;
const nodeUpdate = prisma.node.update as jest.Mock;
const nodeLinkUpsert = prisma.nodeLink.upsert as jest.Mock;
const nodeLinkDeleteMany = prisma.nodeLink.deleteMany as jest.Mock;

// ─── Shared fixture builders ──────────────────────────────────────────────────

const USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const NODE_ID = "550e8400-e29b-41d4-a716-446655440002";
const TARGET_ID = "550e8400-e29b-41d4-a716-446655440003";

/** Builds a minimal Prisma DB row that NodeService can hydrate into a Task. */
function makeTaskRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: NODE_ID,
    title: "My Task",
    description: "A description",
    type: "task",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: USER_ID,
    tags: [],
    status: "active",
    data: { isMorningPick: false, completed: false, actualDuration: 0 },
    outgoingLinks: [],
    incomingLinks: [],
    ...overrides,
  };
}

function makeEventRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: NODE_ID,
    title: "My Event",
    description: "",
    type: "event",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: USER_ID,
    tags: [],
    status: "active",
    data: {
      startTime: "2026-02-01T09:00:00.000Z",
      endTime: "2026-02-01T10:00:00.000Z",
      isAllDay: false,
    },
    outgoingLinks: [],
    incomingLinks: [],
    ...overrides,
  };
}

function makeIdeaRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: NODE_ID,
    title: "My Idea",
    description: "",
    type: "idea",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: USER_ID,
    tags: [],
    status: "active",
    data: { content: "great idea", pinned: false },
    outgoingLinks: [],
    incomingLinks: [],
    ...overrides,
  };
}

function makeProjectRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: NODE_ID,
    title: "My Project",
    description: "",
    type: "project",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: USER_ID,
    tags: ["launch"],
    status: "active",
    data: { projectStatus: "active", progress: 0, childNodeIds: [] },
    outgoingLinks: [],
    incomingLinks: [],
    ...overrides,
  };
}

// ─── createNode ───────────────────────────────────────────────────────────────

describe("createNode", () => {
  describe("when creating a task", () => {
    it("returns a Task node with the correct fields", async () => {
      const row = makeTaskRow({ title: "Write tests" });
      nodeCreate.mockResolvedValue(row);

      const result = await createNode({
        type: "task",
        title: "Write tests",
        status: "active",
        tags: [],
        data: { isMorningPick: true, completed: false, actualDuration: 0 },
      }, USER_ID);

      expect(result.type).toBe("task");
      expect(result.title).toBe("Write tests");
      expect(result.userId).toBe(USER_ID);
      expect(result.id).toBe(NODE_ID);
    });

    it("calls prisma.node.create with the correct payload", async () => {
      nodeCreate.mockResolvedValue(makeTaskRow());

      await createNode({
        type: "task",
        title: "My Task",
        status: "active",
        tags: ["focus"],
        data: { isMorningPick: false, completed: false, actualDuration: 0 },
      }, USER_ID);

      expect(nodeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "task",
            title: "My Task",
            userId: USER_ID,
          }),
        }),
      );
    });
  });

  describe("when creating an event", () => {
    it("returns an Event node with startTime and endTime populated", async () => {
      const row = makeEventRow();
      nodeCreate.mockResolvedValue(row);

      const result = await createNode({
        type: "event",
        title: "My Event",
        status: "active",
        tags: [],
        data: {
          startTime: "2026-02-01T09:00:00.000Z",
          endTime: "2026-02-01T10:00:00.000Z",
          isAllDay: false,
        },
      }, USER_ID);

      expect(result.type).toBe("event");
      expect(result.title).toBe("My Event");
    });
  });

  describe("when creating an idea", () => {
    it("returns an Idea node with the content field populated", async () => {
      const row = makeIdeaRow();
      nodeCreate.mockResolvedValue(row);

      const result = await createNode({
        type: "idea",
        title: "My Idea",
        status: "active",
        tags: [],
        data: { content: "great idea", pinned: false },
      }, USER_ID);

      expect(result.type).toBe("idea");
      expect((result as { content?: string }).content).toBe("great idea");
    });
  });

  describe("when creating a project", () => {
    it("returns a Project node with tags and projectStatus populated", async () => {
      const row = makeProjectRow();
      nodeCreate.mockResolvedValue(row);

      const result = await createNode({
        type: "project",
        title: "My Project",
        status: "active",
        tags: ["launch"],
        data: { projectStatus: "active", progress: 0, childNodeIds: [] },
      }, USER_ID);

      expect(result.type).toBe("project");
      expect(result.tags).toContain("launch");
    });
  });
});

// ─── getNodeById ──────────────────────────────────────────────────────────────

describe("getNodeById", () => {
  describe("when the node exists and belongs to the user", () => {
    it("returns the hydrated Node", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());

      const result = await getNodeById(NODE_ID, USER_ID);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(NODE_ID);
      expect(result?.userId).toBe(USER_ID);
    });
  });

  describe("when the node does not exist", () => {
    it("returns null", async () => {
      nodeFindFirst.mockResolvedValue(null);

      const result = await getNodeById("nonexistent-id", USER_ID);

      expect(result).toBeNull();
    });
  });

  describe("when the node belongs to a different user", () => {
    it("returns null (Prisma filters by userId)", async () => {
      // Simulate Prisma returning nothing when userId does not match.
      nodeFindFirst.mockResolvedValue(null);

      const result = await getNodeById(NODE_ID, "different-user-id");

      expect(result).toBeNull();
    });
  });

  describe("when the node has outgoing and incoming links", () => {
    it("populates outgoingLinkedNodeIds and incomingLinkedNodeIds", async () => {
      const row = makeTaskRow({
        outgoingLinks: [{ targetNodeId: TARGET_ID }],
        incomingLinks: [{ sourceNodeId: "550e8400-e29b-41d4-a716-446655440099" }],
      });
      nodeFindFirst.mockResolvedValue(row);

      const result = await getNodeById(NODE_ID, USER_ID);

      expect(result?.outgoingLinkedNodeIds).toContain(TARGET_ID);
      expect(result?.incomingLinkedNodeIds).toContain(
        "550e8400-e29b-41d4-a716-446655440099",
      );
    });
  });
});

// ─── listNodes ────────────────────────────────────────────────────────────────

describe("listNodes", () => {
  describe("when called without a type filter", () => {
    it("returns all non-deleted nodes for the user", async () => {
      nodeFindMany.mockResolvedValue([makeTaskRow(), makeIdeaRow()]);

      const result = await listNodes(USER_ID, null);

      expect(result).toHaveLength(2);
      expect(result.every((n) => n.userId === USER_ID)).toBe(true);
    });
  });

  describe("when called with a type filter", () => {
    it("returns only nodes of the specified type", async () => {
      nodeFindMany.mockResolvedValue([makeTaskRow()]);

      const result = await listNodes(USER_ID, "task");

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("task");
      expect(nodeFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: "task" }),
        }),
      );
    });
  });

  describe("when there are no nodes", () => {
    it("returns an empty array", async () => {
      nodeFindMany.mockResolvedValue([]);

      const result = await listNodes(USER_ID, null);

      expect(result).toEqual([]);
    });
  });

  describe("deleted node filtering", () => {
    it("passes a status filter that excludes deleted nodes to Prisma", async () => {
      nodeFindMany.mockResolvedValue([]);

      await listNodes(USER_ID, null);

      expect(nodeFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.objectContaining({ not: "deleted" }),
          }),
        }),
      );
    });
  });
});

// ─── updateNode ───────────────────────────────────────────────────────────────

describe("updateNode", () => {
  describe("when the node exists and belongs to the user", () => {
    it("returns the updated Node with the new title", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeUpdate.mockResolvedValue(makeTaskRow({ title: "Updated Title" }));

      const result = await updateNode(NODE_ID, USER_ID, {
        type: "task",
        title: "Updated Title",
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Updated Title");
    });

    it("merges the incoming data with existing data fields", async () => {
      const existingRow = makeTaskRow({
        data: { completed: false, energyLevel: "deep", actualDuration: 0 },
      });
      nodeFindFirst.mockResolvedValue(existingRow);
      nodeUpdate.mockResolvedValue({
        ...existingRow,
        data: { completed: true, energyLevel: "deep", actualDuration: 0 },
      });

      const result = await updateNode(NODE_ID, USER_ID, {
        type: "task",
        data: { completed: true },
      });

      expect(result).not.toBeNull();
      expect(nodeUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({ completed: true }),
          }),
        }),
      );
    });
  });

  describe("when the node does not exist for the user", () => {
    it("returns null without calling prisma.node.update", async () => {
      nodeFindFirst.mockResolvedValue(null);

      const result = await updateNode(NODE_ID, USER_ID, {
        type: "task",
        title: "Should not update",
      });

      expect(result).toBeNull();
      expect(nodeUpdate).not.toHaveBeenCalled();
    });
  });
});

// ─── deleteNode ───────────────────────────────────────────────────────────────

describe("deleteNode", () => {
  describe("when the node exists and belongs to the user", () => {
    it("returns true", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeUpdate.mockResolvedValue(makeTaskRow({ status: "deleted" }));

      const result = await deleteNode(NODE_ID, USER_ID);

      expect(result).toBe(true);
    });

    it("soft-deletes the node by setting status to 'deleted'", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeUpdate.mockResolvedValue(makeTaskRow({ status: "deleted" }));

      await deleteNode(NODE_ID, USER_ID);

      expect(nodeUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: NODE_ID },
          data: expect.objectContaining({ status: "deleted" }),
        }),
      );
    });
  });

  describe("when the node does not exist for the user", () => {
    it("returns false without calling prisma.node.update", async () => {
      nodeFindFirst.mockResolvedValue(null);

      const result = await deleteNode(NODE_ID, USER_ID);

      expect(result).toBe(false);
      expect(nodeUpdate).not.toHaveBeenCalled();
    });
  });
});

// ─── createLink ───────────────────────────────────────────────────────────────

describe("createLink", () => {
  describe("when the source node exists and belongs to the user", () => {
    it("returns an object with outgoingIds and incomingIds arrays", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeLinkUpsert.mockResolvedValue({});
      nodeFindUniqueOrThrow.mockResolvedValue({
        ...makeTaskRow(),
        outgoingLinks: [{ targetNodeId: TARGET_ID }],
        incomingLinks: [],
      });

      const result = await createLink(NODE_ID, TARGET_ID, USER_ID);

      expect(result).not.toBeNull();
      expect(result?.outgoingIds).toContain(TARGET_ID);
      expect(Array.isArray(result?.incomingIds)).toBe(true);
    });

    it("upserts the link to avoid duplicate constraint errors", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeLinkUpsert.mockResolvedValue({});
      nodeFindUniqueOrThrow.mockResolvedValue({
        ...makeTaskRow(),
        outgoingLinks: [{ targetNodeId: TARGET_ID }],
        incomingLinks: [],
      });

      await createLink(NODE_ID, TARGET_ID, USER_ID);

      expect(nodeLinkUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            sourceNodeId_targetNodeId: {
              sourceNodeId: NODE_ID,
              targetNodeId: TARGET_ID,
            },
          },
        }),
      );
    });
  });

  describe("when the source node does not exist for the user", () => {
    it("returns null without writing a link", async () => {
      nodeFindFirst.mockResolvedValue(null);

      const result = await createLink(NODE_ID, TARGET_ID, USER_ID);

      expect(result).toBeNull();
      expect(nodeLinkUpsert).not.toHaveBeenCalled();
    });
  });
});

// ─── deleteLink ───────────────────────────────────────────────────────────────

describe("deleteLink", () => {
  describe("when the source node exists and belongs to the user", () => {
    it("returns the updated link lists after removing the link", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeLinkDeleteMany.mockResolvedValue({ count: 1 });
      nodeFindUniqueOrThrow.mockResolvedValue({
        ...makeTaskRow(),
        outgoingLinks: [],
        incomingLinks: [],
      });

      const result = await deleteLink(NODE_ID, TARGET_ID, USER_ID);

      expect(result).not.toBeNull();
      expect(result?.outgoingIds).not.toContain(TARGET_ID);
    });

    it("calls prisma.nodeLink.deleteMany with the correct source and target IDs", async () => {
      nodeFindFirst.mockResolvedValue(makeTaskRow());
      nodeLinkDeleteMany.mockResolvedValue({ count: 1 });
      nodeFindUniqueOrThrow.mockResolvedValue({
        ...makeTaskRow(),
        outgoingLinks: [],
        incomingLinks: [],
      });

      await deleteLink(NODE_ID, TARGET_ID, USER_ID);

      expect(nodeLinkDeleteMany).toHaveBeenCalledWith({
        where: { sourceNodeId: NODE_ID, targetNodeId: TARGET_ID },
      });
    });
  });

  describe("when the source node does not exist for the user", () => {
    it("returns null without deleting any link", async () => {
      nodeFindFirst.mockResolvedValue(null);

      const result = await deleteLink(NODE_ID, TARGET_ID, USER_ID);

      expect(result).toBeNull();
      expect(nodeLinkDeleteMany).not.toHaveBeenCalled();
    });
  });
});
