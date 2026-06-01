import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Node, NodeStatus, NodeType } from "@/lib/models";
import {
  createLink,
  createNode,
  deleteLink,
  deleteNodeById,
  getNodeById,
  listNodes,
  updateNodeById,
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
      return await listNodes(type);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const fetchNodeById = createAsyncThunk<Node, string, ThunkConfig>(
  "node/fetchNodeById",
  async (nodeId, thunkAPI) => {
    try {
      return await getNodeById(nodeId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const createNodeThunk = createAsyncThunk<Node, CreateNodeInput, ThunkConfig>(
  "node/createNode",
  async (data, thunkAPI) => {
    try {
      return await createNode(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const updateNodeThunk = createAsyncThunk<Node, UpdateNodeArgs, ThunkConfig>(
  "node/updateNode",
  async ({ nodeId, data }, thunkAPI) => {
    try {
      return await updateNodeById(nodeId, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const deleteNodeThunk = createAsyncThunk<string, string, ThunkConfig>(
  "node/deleteNode",
  async (nodeId, thunkAPI) => {
    try {
      await deleteNodeById(nodeId);
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
      const result = await createLink(nodeId, targetNodeId);
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
      const result = await deleteLink(nodeId, targetNodeId);
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
      .addCase(createNodeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createNodeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        upsertNode(state, action.payload);
      })
      .addCase(createNodeThunk.rejected, (state, action) => {
        state.status = "failed";
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
