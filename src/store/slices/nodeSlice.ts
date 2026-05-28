import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Node, NodeStatus, NodeType } from "@/lib/models";
import type { RootState } from "../store";

type NodesStatus = "idle" | "loading" | "succeeded" | "failed";

export interface NodeFilter {
  type: NodeType | "all",
  status: Exclude<NodeStatus, "deleted"> | "all",
  search: string
}

export interface NodeState {
  entities: Record<string, Node>,
  ids: string[],
  selectedNodeId: string | null,
  status: NodesStatus,
  error: string | null,
  initialized: boolean,
  filters: NodeFilter
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
    search: ""
  }
}

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<Node[]>) {
      state.entities = {};
      state.ids = [];

      for (const node of action.payload) {
        state.entities[node.id] = node;
        state.ids.push(node.id);
      }
    },
    upsertNode(state, action: PayloadAction<Node>) {
      const node = action.payload;
      const exists = Boolean(state.entities[node.id]);

      state.entities[node.id] = node;
      if (!exists) {
        state.ids.push(node.id);
      }
    },
    removeNode(state, action: PayloadAction<string>) {
      const nodeId = action.payload;
      delete state.entities[nodeId];
      state.ids = state.ids.filter((id) => id !== nodeId);
      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }
    },
    setSelectedNodeId(state, action: PayloadAction<string | null>) {
      state.selectedNodeId = action.payload;
    },
    setNodesStatus(state, action: PayloadAction<NodesStatus>) {
      state.status = action.payload;
    },
    setNodesError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setNodesInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    setNodeFilters(state, action: PayloadAction<Partial<NodeFilter>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    }
  }
})

export const {
  setNodes,
  upsertNode,
  removeNode,
  setSelectedNodeId,
  setNodesStatus,
  setNodesError,
  setNodesInitialized,
  setNodeFilters,
} = nodeSlice.actions;

export const selectNodeState = (state: RootState) => state.nodes;
export const selectNodeIds = (state: RootState) => state.nodes.ids;
export const selectNodeEntities = (state: RootState) => state.nodes.entities;
export const selectAllNodes = (state: RootState) =>
  state.nodes.ids
    .map((id) => state.nodes.entities[id])
    .filter((node): node is Node => Boolean(node));
export const selectNodeById = (state: RootState, nodeId: string) =>
  state.nodes.entities[nodeId] ?? null;
export const selectNodesByType = (state: RootState, type: NodeType) =>
  selectAllNodes(state).filter((node) => node.type === type);

export default nodeSlice.reducer;