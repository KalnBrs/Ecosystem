import { createSlice } from "@reduxjs/toolkit";
import { Node, NodeStatus, NodeType } from "@/lib/models";

type NodesStatus = "idle" | "loading" | "succeeded" | "failed";

export interface NodeFilter {
  type: NodeType | "all",
  status: Exclude<NodeStatus, "deleted"> | "all",
  search: string
}

export interface NodeState {
  items: string[],
  selectedNodeId: string | null,
  status: NodesStatus,
  error: string | null,
  initialized: boolean,
  filters: NodeFilter
}

export const initialState = {
  items: [],
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

  }
})

export const {  } = nodeSlice.actions;
export default nodeSlice.reducer;