/**
 * nodeSlice tests
 *
 * Covers:
 *   - Initial state shape
 *   - Sync reducers: setSelectedNodeId, setNodeFilters
 *   - Async thunk state transitions for all 7 thunks (pending / fulfilled / rejected)
 *   - Selectors: selectAllNodes, selectAllTasks, selectActiveTasks,
 *                makeSelectTasksByEnergyLevel, selectNodesStatus/Error/Initialized
 */

import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/store/api/nodesApi", () => ({
  listNodes: jest.fn(),
  getNodeById: jest.fn(),
  createNode: jest.fn(),
  updateNodeById: jest.fn(),
  deleteNodeById: jest.fn(),
  createLink: jest.fn(),
  deleteLink: jest.fn(),
}));

import nodeReducer, {
  initialState,
  NodeState,
  setSelectedNodeId,
  setNodeFilters,
  fetchNodes,
  fetchNodeById,
  createNodeThunk,
  updateNodeThunk,
  deleteNodeThunk,
  createLinkThunk,
  deleteLinkThunk,
  selectAllNodes,
  selectAllTasks,
  selectActiveTasks,
  makeSelectTasksByEnergyLevel,
  selectNodesStatus,
  selectNodesError,
  selectNodesInitialized,
} from "@/store/slices/nodeSlice";
import {
  listNodes,
  getNodeById,
  createNode,
  updateNodeById,
  deleteNodeById,
  createLink,
  deleteLink,
} from "@/store/api/nodesApi";
import { Node } from "@/lib/models";

// ─── Mock accessors ───────────────────────────────────────────────────────────

const mockListNodes = listNodes as jest.Mock;
const mockGetNodeById = getNodeById as jest.Mock;
const mockCreateNode = createNode as jest.Mock;
const mockUpdateNodeById = updateNodeById as jest.Mock;
const mockDeleteNodeById = deleteNodeById as jest.Mock;
const mockCreateLink = createLink as jest.Mock;
const mockDeleteLink = deleteLink as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "user-1";

function makeTask(overrides: Record<string, unknown> = {}): Node {
  return {
    id: "task-1",
    title: "A Task",
    description: "",
    type: "task",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    userId: USER_ID,
    tags: [],
    outgoingLinkedNodeIds: [],
    incomingLinkedNodeIds: [],
    status: "active",
    completed: false,
    energyLevel: "deep",
    isMorningPick: false,
    ...overrides,
  } as unknown as Node;
}

function makeIdea(overrides: Record<string, unknown> = {}): Node {
  return {
    id: "idea-1",
    title: "An Idea",
    description: "",
    type: "idea",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    userId: USER_ID,
    tags: [],
    outgoingLinkedNodeIds: [],
    incomingLinkedNodeIds: [],
    status: "active",
    ...overrides,
  } as unknown as Node;
}

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeTestStore() {
  return configureStore({ reducer: { nodes: nodeReducer } });
}

/** Build a full state tree from an array of nodes for use in selector tests. */
function stateWith(
  nodes: Node[],
  extra: Partial<NodeState> = {}
): { nodes: NodeState } {
  const entities: Record<string, Node> = {};
  const ids: string[] = [];
  for (const n of nodes) {
    entities[n.id] = n;
    ids.push(n.id);
  }
  return { nodes: { ...initialState, entities, ids, ...extra } };
}

// ─── Initial state ────────────────────────────────────────────────────────────

describe("initialState", () => {
  it("has the expected shape", () => {
    expect(nodeReducer(undefined, { type: "@@INIT" })).toEqual({
      entities: {},
      ids: [],
      selectedNodeId: null,
      status: "idle",
      error: null,
      initialized: false,
      filters: { type: "all", status: "all", search: "" },
    });
  });
});

// ─── Sync reducers ────────────────────────────────────────────────────────────

describe("setSelectedNodeId", () => {
  it("sets the selected node id", () => {
    const s = nodeReducer(initialState, setSelectedNodeId("task-1"));
    expect(s.selectedNodeId).toBe("task-1");
  });

  it("clears the selected node id when null is passed", () => {
    const primed = { ...initialState, selectedNodeId: "task-1" };
    const s = nodeReducer(primed, setSelectedNodeId(null));
    expect(s.selectedNodeId).toBeNull();
  });
});

describe("setNodeFilters", () => {
  it("merges a partial update into existing filters", () => {
    const s = nodeReducer(initialState, setNodeFilters({ type: "task" }));
    expect(s.filters).toEqual({ type: "task", status: "all", search: "" });
  });

  it("updates multiple fields at once without clearing others", () => {
    const s = nodeReducer(
      initialState,
      setNodeFilters({ type: "event", search: "standup" })
    );
    expect(s.filters).toEqual({ type: "event", status: "all", search: "standup" });
  });
});

// ─── fetchNodes ───────────────────────────────────────────────────────────────

describe("fetchNodes", () => {
  it("sets status to loading and clears error on pending", () => {
    const s = nodeReducer(
      { ...initialState, error: "previous error" },
      fetchNodes.pending("req", undefined)
    );
    expect(s.status).toBe("loading");
    expect(s.error).toBeNull();
  });

  it("populates entities, ids, and sets initialized on fulfilled", async () => {
    const store = makeTestStore();
    const nodes = [makeTask(), makeIdea()];
    mockListNodes.mockResolvedValue(nodes);

    await store.dispatch(fetchNodes());

    const s = store.getState().nodes;
    expect(s.status).toBe("succeeded");
    expect(s.ids).toEqual(["task-1", "idea-1"]);
    expect(s.entities["task-1"]).toEqual(nodes[0]);
    expect(s.initialized).toBe(true);
  });

  it("replaces all existing entities on each fulfilled call", async () => {
    const store = makeTestStore();
    mockListNodes
      .mockResolvedValueOnce([makeTask()])
      .mockResolvedValueOnce([makeIdea()]);

    await store.dispatch(fetchNodes());
    await store.dispatch(fetchNodes());

    const s = store.getState().nodes;
    expect(s.ids).toEqual(["idea-1"]);
    expect(s.entities["task-1"]).toBeUndefined();
  });

  it("sets status to failed and captures the error message on rejected", async () => {
    const store = makeTestStore();
    mockListNodes.mockRejectedValue(new Error("Network error"));

    await store.dispatch(fetchNodes());

    const s = store.getState().nodes;
    expect(s.status).toBe("failed");
    expect(s.error).toBe("Network error");
  });

  it("uses fallback error message when rejectWithValue payload is absent", () => {
    const s = nodeReducer(
      initialState,
      fetchNodes.rejected(new Error(), "req", undefined, undefined)
    );
    expect(s.error).toBe("Failed to fetch nodes");
  });
});

// ─── fetchNodeById ────────────────────────────────────────────────────────────

describe("fetchNodeById", () => {
  it("upserts the returned node on fulfilled", async () => {
    const store = makeTestStore();
    const node = makeTask({ id: "task-99" });
    mockGetNodeById.mockResolvedValue(node);

    await store.dispatch(fetchNodeById("task-99"));

    const s = store.getState().nodes;
    expect(s.status).toBe("succeeded");
    expect(s.entities["task-99"]).toEqual(node);
  });

  it("does not duplicate ids if the node already exists", async () => {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask()]);
    await store.dispatch(fetchNodes());

    mockGetNodeById.mockResolvedValue(makeTask({ title: "Refreshed" }));
    await store.dispatch(fetchNodeById("task-1"));

    expect(store.getState().nodes.ids.filter((id) => id === "task-1")).toHaveLength(1);
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockGetNodeById.mockRejectedValue(new Error("Not found"));

    await store.dispatch(fetchNodeById("task-99"));

    expect(store.getState().nodes.error).toBe("Not found");
  });
});

// ─── createNodeThunk ──────────────────────────────────────────────────────────

describe("createNodeThunk", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = { title: "New Task", type: "task" } as any;

  it("sets status to loading on pending", () => {
    const s = nodeReducer(initialState, createNodeThunk.pending("req", input));
    expect(s.status).toBe("loading");
    expect(s.error).toBeNull();
  });

  it("adds the created node to entities and ids on fulfilled", async () => {
    const store = makeTestStore();
    const node = makeTask({ id: "new-task" });
    mockCreateNode.mockResolvedValue(node);

    await store.dispatch(createNodeThunk(input));

    const s = store.getState().nodes;
    expect(s.status).toBe("succeeded");
    expect(s.ids).toContain("new-task");
    expect(s.entities["new-task"]).toEqual(node);
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockCreateNode.mockRejectedValue(new Error("Validation failed"));

    await store.dispatch(createNodeThunk(input));

    expect(store.getState().nodes.status).toBe("failed");
    expect(store.getState().nodes.error).toBe("Validation failed");
  });
});

// ─── updateNodeThunk ──────────────────────────────────────────────────────────

describe("updateNodeThunk", () => {
  it("replaces the node in entities without duplicating its id", async () => {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask({ title: "Old title" })]);
    await store.dispatch(fetchNodes());

    const updated = makeTask({ title: "New title" });
    mockUpdateNodeById.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await store.dispatch(updateNodeThunk({ nodeId: "task-1", data: { title: "New title" } as any }));

    const s = store.getState().nodes;
    expect(s.entities["task-1"]?.title).toBe("New title");
    expect(s.ids.filter((id) => id === "task-1")).toHaveLength(1);
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockUpdateNodeById.mockRejectedValue(new Error("Not found"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await store.dispatch(updateNodeThunk({ nodeId: "task-1", data: {} as any }));

    expect(store.getState().nodes.error).toBe("Not found");
  });
});

// ─── deleteNodeThunk ──────────────────────────────────────────────────────────

describe("deleteNodeThunk", () => {
  async function storeWithTask() {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask()]);
    await store.dispatch(fetchNodes());
    mockDeleteNodeById.mockResolvedValue(undefined);
    return store;
  }

  it("removes the node from entities and ids on fulfilled", async () => {
    const store = await storeWithTask();

    await store.dispatch(deleteNodeThunk("task-1"));

    const s = store.getState().nodes;
    expect(s.ids).not.toContain("task-1");
    expect(s.entities["task-1"]).toBeUndefined();
  });

  it("clears selectedNodeId when the deleted node was selected", async () => {
    const store = await storeWithTask();
    store.dispatch(setSelectedNodeId("task-1"));

    await store.dispatch(deleteNodeThunk("task-1"));

    expect(store.getState().nodes.selectedNodeId).toBeNull();
  });

  it("preserves selectedNodeId when a different node is deleted", async () => {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask(), makeIdea()]);
    await store.dispatch(fetchNodes());
    store.dispatch(setSelectedNodeId("task-1"));
    mockDeleteNodeById.mockResolvedValue(undefined);

    await store.dispatch(deleteNodeThunk("idea-1"));

    expect(store.getState().nodes.selectedNodeId).toBe("task-1");
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockDeleteNodeById.mockRejectedValue(new Error("Not found"));

    await store.dispatch(deleteNodeThunk("task-1"));

    expect(store.getState().nodes.error).toBe("Not found");
  });
});

// ─── createLinkThunk ──────────────────────────────────────────────────────────

describe("createLinkThunk", () => {
  it("updates outgoing and incoming ids on the source node", async () => {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask()]);
    await store.dispatch(fetchNodes());

    mockCreateLink.mockResolvedValue({ outgoingIds: ["idea-1"], incomingIds: [] });

    await store.dispatch(createLinkThunk({ nodeId: "task-1", targetNodeId: "idea-1" }));

    const node = store.getState().nodes.entities["task-1"];
    expect(node?.outgoingLinkedNodeIds).toEqual(["idea-1"]);
    expect(node?.incomingLinkedNodeIds).toEqual([]);
  });

  it("succeeds silently when the nodeId is not in entities", async () => {
    const store = makeTestStore();
    mockCreateLink.mockResolvedValue({ outgoingIds: [], incomingIds: [] });

    await store.dispatch(createLinkThunk({ nodeId: "missing", targetNodeId: "idea-1" }));

    expect(store.getState().nodes.status).toBe("succeeded");
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockCreateLink.mockRejectedValue(new Error("Node not found"));

    await store.dispatch(createLinkThunk({ nodeId: "task-1", targetNodeId: "idea-1" }));

    expect(store.getState().nodes.error).toBe("Node not found");
  });
});

// ─── deleteLinkThunk ──────────────────────────────────────────────────────────

describe("deleteLinkThunk", () => {
  it("clears the removed link from the source node's ids", async () => {
    const store = makeTestStore();
    mockListNodes.mockResolvedValue([makeTask({ outgoingLinkedNodeIds: ["idea-1"] })]);
    await store.dispatch(fetchNodes());

    mockDeleteLink.mockResolvedValue({ outgoingIds: [], incomingIds: [] });

    await store.dispatch(deleteLinkThunk({ nodeId: "task-1", targetNodeId: "idea-1" }));

    expect(store.getState().nodes.entities["task-1"]?.outgoingLinkedNodeIds).toEqual([]);
  });

  it("sets error on rejected", async () => {
    const store = makeTestStore();
    mockDeleteLink.mockRejectedValue(new Error("Node not found"));

    await store.dispatch(deleteLinkThunk({ nodeId: "task-1", targetNodeId: "idea-1" }));

    expect(store.getState().nodes.error).toBe("Node not found");
  });
});

// ─── Meta selectors ───────────────────────────────────────────────────────────

describe("selectNodesStatus / selectNodesError / selectNodesInitialized", () => {
  it("returns the correct meta values from state", () => {
    const state = {
      nodes: { ...initialState, status: "failed" as const, error: "Oops", initialized: true },
    };
    expect(selectNodesStatus(state)).toBe("failed");
    expect(selectNodesError(state)).toBe("Oops");
    expect(selectNodesInitialized(state)).toBe(true);
  });
});

// ─── selectAllNodes ───────────────────────────────────────────────────────────

describe("selectAllNodes", () => {
  it("returns nodes in insertion order", () => {
    const task = makeTask();
    const idea = makeIdea();
    expect(selectAllNodes(stateWith([task, idea]))).toEqual([task, idea]);
  });

  it("returns an empty array when there are no nodes", () => {
    expect(selectAllNodes({ nodes: initialState })).toEqual([]);
  });
});

// ─── selectAllTasks ───────────────────────────────────────────────────────────

describe("selectAllTasks", () => {
  it("returns only nodes with type === 'task'", () => {
    const task = makeTask();
    const idea = makeIdea();
    expect(selectAllTasks(stateWith([task, idea]))).toEqual([task]);
  });

  it("returns an empty array when there are no task-type nodes", () => {
    expect(selectAllTasks(stateWith([makeIdea()]))).toEqual([]);
  });
});

// ─── selectActiveTasks ────────────────────────────────────────────────────────

describe("selectActiveTasks", () => {
  it("returns only tasks that are active and not completed", () => {
    const active = makeTask({ id: "t1", status: "active", completed: false });
    const done = makeTask({ id: "t2", status: "active", completed: true });
    const archived = makeTask({ id: "t3", status: "archived", completed: false });
    const idea = makeIdea();

    expect(selectActiveTasks(stateWith([active, done, archived, idea]))).toEqual([active]);
  });

  it("returns an empty array when no tasks are active and incomplete", () => {
    expect(selectActiveTasks(stateWith([makeTask({ completed: true })]))).toEqual([]);
  });
});

// ─── makeSelectTasksByEnergyLevel ─────────────────────────────────────────────

describe("makeSelectTasksByEnergyLevel", () => {
  const selectDeep = makeSelectTasksByEnergyLevel("deep");
  const selectLight = makeSelectTasksByEnergyLevel("light");
  const selectQuick = makeSelectTasksByEnergyLevel("quick");

  const deepTask = makeTask({ id: "t-deep", energyLevel: "deep" });
  const lightTask = makeTask({ id: "t-light", energyLevel: "light" });
  const quickTask = makeTask({ id: "t-quick", energyLevel: "quick" });
  const noEnergyTask = makeTask({ id: "t-none", energyLevel: undefined });

  const fullState = stateWith([deepTask, lightTask, quickTask, noEnergyTask]);

  it("returns only deep tasks", () => {
    expect(selectDeep(fullState)).toEqual([deepTask]);
  });

  it("returns only light tasks", () => {
    expect(selectLight(fullState)).toEqual([lightTask]);
  });

  it("returns only quick tasks", () => {
    expect(selectQuick(fullState)).toEqual([quickTask]);
  });

  it("excludes tasks with no energyLevel set", () => {
    expect(selectDeep(stateWith([noEnergyTask]))).toEqual([]);
  });

  it("excludes completed tasks regardless of energy level", () => {
    const completedDeep = makeTask({ id: "cd", energyLevel: "deep", completed: true });
    expect(selectDeep(stateWith([completedDeep]))).toEqual([]);
  });

  it("excludes archived tasks regardless of energy level", () => {
    const archivedDeep = makeTask({ id: "ad", energyLevel: "deep", status: "archived" });
    expect(selectDeep(stateWith([archivedDeep]))).toEqual([]);
  });
});
