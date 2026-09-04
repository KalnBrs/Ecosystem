import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { Node, NodeStatus, NodeType, Task } from "@/lib/models";
import {
  submitCreateLink,
  submitCreateNode,
  submitDeleteLink,
  submitDeleteNodeById,
  submitGetNodeById,
  submitListNodes,
  submitUpdateNodeById,
  type LinkResult,
} from "../api/nodesApi";
import { CreateNodeInput, UpdateNodeInput } from "@/lib/schemas/node.schema";

// ─── Thunk arg/return types ───────────────────────────────────────────────────

interface ThunkConfig {
  rejectValue: string;
}

interface UpdateNodeArgs {
  nodeId: string;
  data: UpdateNodeInput;
}

interface LinkNodeArgs {
  nodeId: string;
  targetNodeId: string;
}

interface LinkThunkResult extends LinkResult {
  nodeId: string;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchNodes = createAsyncThunk<Node[], NodeType | undefined, ThunkConfig>(
  "node/fetchNodes",
  async (type, thunkAPI) => {
    try {
      return await submitListNodes(type);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const fetchNodeById = createAsyncThunk<Node, string, ThunkConfig>(
  "node/fetchNodeById",
  async (nodeId, thunkAPI) => {
    try {
      return await submitGetNodeById(nodeId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const createNodeThunk = createAsyncThunk<Node, CreateNodeInput, ThunkConfig>(
  "node/createNode",
  async (data, thunkAPI) => {
    try {
      return await submitCreateNode(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const updateNodeThunk = createAsyncThunk<Node, UpdateNodeArgs, ThunkConfig>(
  "node/updateNode",
  async ({ nodeId, data }, thunkAPI) => {
    try {
      return await submitUpdateNodeById(nodeId, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const deleteNodeThunk = createAsyncThunk<string, string, ThunkConfig>(
  "node/deleteNode",
  async (nodeId, thunkAPI) => {
    try {
      await submitDeleteNodeById(nodeId);
      return nodeId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const createLinkThunk = createAsyncThunk<LinkThunkResult, LinkNodeArgs, ThunkConfig>(
  "node/createLink",
  async ({ nodeId, targetNodeId }, thunkAPI) => {
    try {
      const result = await submitCreateLink(nodeId, targetNodeId);
      return { nodeId, ...result };
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const deleteLinkThunk = createAsyncThunk<LinkThunkResult, LinkNodeArgs, ThunkConfig>(
  "node/deleteLink",
  async ({ nodeId, targetNodeId }, thunkAPI) => {
    try {
      const result = await submitDeleteLink(nodeId, targetNodeId);
      return { nodeId, ...result };
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

type NodesStatus = "idle" | "loading" | "succeeded" | "failed";

export interface NodeFilter {
  type: NodeType | "all";
  status: Exclude<NodeStatus, "deleted"> | "all";
  search: string;
}

export interface NodeState {
  entities: Record<string, Node>;
  ids: string[];
  selectedNodeId: string | null;
  status: NodesStatus;
  error: string | null;
  initialized: boolean;
  filters: NodeFilter;
}

export const initialState: NodeState = {
  entities: {},
  ids: [],
  selectedNodeId: null,
  status: "idle",
  error: null,
  initialized: false,
  filters: {
    type: "all",
    status: "all",
    search: "",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function upsertNode(state: NodeState, node: Node) {
  const exists = Boolean(state.entities[node.id]);
  state.entities[node.id] = node;
  if (!exists) state.ids.push(node.id);
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const nodeSlice = createSlice({
  name: "node",
  initialState,
  reducers: {
    setSelectedNodeId(state, action: PayloadAction<string | null>) {
      state.selectedNodeId = action.payload;
    },
    setNodeFilters(state, action: PayloadAction<Partial<NodeFilter>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // ── fetchNodes ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.entities = {};
        state.ids = [];
        for (const node of action.payload) {
          state.entities[node.id] = node;
          state.ids.push(node.id);
        }
        state.initialized = true;
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch nodes";
      });

    // ── fetchNodeById ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchNodeById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNodeById.fulfilled, (state, action) => {
        state.status = "succeeded";
        upsertNode(state, action.payload);
      })
      .addCase(fetchNodeById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch node";
      });

    // ── createNodeThunk ───────────────────────────────────────────────────────
    builder
      .addCase(createNodeThunk.pending, (state, action) => {
        state.error = null;
        const tempId = `temp-${action.meta.requestId}`;
        const input = action.meta.arg;
        const now = new Date().toISOString();
        upsertNode(state, {
          id: tempId,
          title: input.title,
          description: input.description ?? "",
          type: input.type,
          createdAt: now,
          updatedAt: now,
          userId: "",
          tags: input.tags ?? [],
          outgoingLinkedNodeIds: [],
          incomingLinkedNodeIds: [],
          status: input.status,
          ...input.data,
        } as unknown as Node);
      })
      .addCase(createNodeThunk.fulfilled, (state, action) => {
        const tempId = `temp-${action.meta.requestId}`;
        delete state.entities[tempId];
        state.ids = state.ids.filter((id) => id !== tempId);
        upsertNode(state, action.payload);
      })
      .addCase(createNodeThunk.rejected, (state, action) => {
        const tempId = `temp-${action.meta.requestId}`;
        delete state.entities[tempId];
        state.ids = state.ids.filter((id) => id !== tempId);
        state.error = action.payload ?? "Failed to create node";
      });

    // ── updateNodeThunk ───────────────────────────────────────────────────────
    builder
      .addCase(updateNodeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateNodeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        upsertNode(state, action.payload);
      })
      .addCase(updateNodeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to update node";
      });

    // ── deleteNodeThunk ───────────────────────────────────────────────────────
    builder
      .addCase(deleteNodeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteNodeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const nodeId = action.payload;
        delete state.entities[nodeId];
        state.ids = state.ids.filter((id) => id !== nodeId);
        if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
      })
      .addCase(deleteNodeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to delete node";
      });

    // ── createLinkThunk ───────────────────────────────────────────────────────
    builder
      .addCase(createLinkThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createLinkThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { nodeId, outgoingIds, incomingIds } = action.payload;
        const node = state.entities[nodeId];
        if (node) {
          node.outgoingLinkedNodeIds = outgoingIds;
          node.incomingLinkedNodeIds = incomingIds;
        }
      })
      .addCase(createLinkThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to create link";
      });

    // ── deleteLinkThunk ───────────────────────────────────────────────────────
    builder
      .addCase(deleteLinkThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteLinkThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { nodeId, outgoingIds, incomingIds } = action.payload;
        const node = state.entities[nodeId];
        if (node) {
          node.outgoingLinkedNodeIds = outgoingIds;
          node.incomingLinkedNodeIds = incomingIds;
        }
      })
      .addCase(deleteLinkThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to delete link";
      });
  },
});

export const { setSelectedNodeId, setNodeFilters } = nodeSlice.actions;
export default nodeSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

// Avoids a circular import with store.ts by narrowing the input type locally.
type NodesRootState = { nodes: NodeState };

const selectNodeEntities = (state: NodesRootState) => state.nodes.entities;
const selectNodeIds = (state: NodesRootState) => state.nodes.ids;

export const selectNodesStatus = (state: NodesRootState) => state.nodes.status;
export const selectNodesError = (state: NodesRootState) => state.nodes.error;
export const selectNodesInitialized = (state: NodesRootState) => state.nodes.initialized;

/** All nodes as an ordered array. */
export const selectAllNodes = createSelector(
  selectNodeEntities,
  selectNodeIds,
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean)
);

function isTask(node: Node): node is Task {
  return node.type === "task";
}

/** All nodes where type === "task". */
export const selectAllTasks = createSelector(selectAllNodes, (nodes) =>
  nodes.filter(isTask)
);

/** Tasks that are active (status === "active") and not yet completed. */
export const selectActiveTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((t) => t.status === "active" && !t.completed)
);

/**
 * Factory that returns a memoized selector for tasks filtered by energy level.
 * Usage: `const selectDeepTasks = makeSelectTasksByEnergyLevel("deep")`
 */
export const makeSelectTasksByEnergyLevel = (
  energyLevel: "deep" | "light" | "quick"
) =>
  createSelector(selectActiveTasks, (tasks) =>
    tasks.filter((t) => t.energyLevel === energyLevel)
  );
