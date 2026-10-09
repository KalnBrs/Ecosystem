/**
 * nodeQueries tests
 *
 * Tests the TanStack Query hooks in src/queries/nodeQueries.ts. The
 * underlying fetch layer (src/store/api/nodesApi.ts) is mocked so only the
 * query/mutation wiring — query keys, cache invalidation, and cache writes —
 * is verified.
 *
 * @jest-environment jsdom
 */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  nodeKeys,
  useNodes,
  useNode,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCreateLink,
  useDeleteLink,
} from "@/queries/nodeQueries";
import {
  submitListNodes,
  submitGetNodeById,
  submitCreateNode,
  submitUpdateNodeById,
  submitDeleteNodeById,
  submitCreateLink,
  submitDeleteLink,
} from "@/store/api/nodesApi";

jest.mock("@/store/api/nodesApi");

const mockSubmitListNodes = submitListNodes as jest.MockedFunction<typeof submitListNodes>;
const mockSubmitGetNodeById = submitGetNodeById as jest.MockedFunction<typeof submitGetNodeById>;
const mockSubmitCreateNode = submitCreateNode as jest.MockedFunction<typeof submitCreateNode>;
const mockSubmitUpdateNodeById = submitUpdateNodeById as jest.MockedFunction<typeof submitUpdateNodeById>;
const mockSubmitDeleteNodeById = submitDeleteNodeById as jest.MockedFunction<typeof submitDeleteNodeById>;
const mockSubmitCreateLink = submitCreateLink as jest.MockedFunction<typeof submitCreateLink>;
const mockSubmitDeleteLink = submitDeleteLink as jest.MockedFunction<typeof submitDeleteLink>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NODE_ID = "550e8400-e29b-41d4-a716-446655440001";
const TARGET_ID = "550e8400-e29b-41d4-a716-446655440002";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { queryClient, Wrapper };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("nodeKeys", () => {
  it("builds list keys", () => {
    expect(nodeKeys.list()).toEqual(["nodes", "list", "all"]);
    expect(nodeKeys.list("task")).toEqual(["nodes", "list", "task"]);
  });

  it("builds detail keys", () => {
    expect(nodeKeys.detail(NODE_ID)).toEqual(["nodes", "detail", NODE_ID]);
  });
});

describe("useNodes", () => {
  it("fetches with no type filter and returns the node list", async () => {
    const data = [{ id: NODE_ID, title: "My Task" }];
    mockSubmitListNodes.mockResolvedValue(data as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useNodes(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitListNodes).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(data);
  });

  it("passes the type filter through to submitListNodes", async () => {
    mockSubmitListNodes.mockResolvedValue([] as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useNodes("task"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitListNodes).toHaveBeenCalledWith("task");
  });
});

describe("useNode", () => {
  it("fetches a single node by id", async () => {
    const data = { id: NODE_ID, title: "My Task" };
    mockSubmitGetNodeById.mockResolvedValue(data as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useNode(NODE_ID), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitGetNodeById).toHaveBeenCalledWith(NODE_ID);
    expect(result.current.data).toEqual(data);
  });

  it("is disabled when id is empty", () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useNode(""), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockSubmitGetNodeById).not.toHaveBeenCalled();
  });
});

describe("useCreateNode", () => {
  it("calls submitCreateNode and invalidates the node lists on success", async () => {
    const payload = { title: "New Task", type: "task" as const };
    const created = { id: NODE_ID, ...payload };
    mockSubmitCreateNode.mockResolvedValue(created as never);
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateNode(), { wrapper: Wrapper });
    result.current.mutate(payload as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitCreateNode).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.lists() });
  });
});

describe("useUpdateNode", () => {
  it("calls submitUpdateNodeById, writes the detail cache, and invalidates lists on success", async () => {
    const patch = { title: "Updated title" };
    const updated = { id: NODE_ID, title: "Updated title" };
    mockSubmitUpdateNodeById.mockResolvedValue(updated as never);
    const { Wrapper, queryClient } = createWrapper();
    const setQueryDataSpy = jest.spyOn(queryClient, "setQueryData");
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateNode(), { wrapper: Wrapper });
    result.current.mutate({ nodeId: NODE_ID, data: patch } as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitUpdateNodeById).toHaveBeenCalledWith(NODE_ID, patch);
    expect(setQueryDataSpy).toHaveBeenCalledWith(nodeKeys.detail(NODE_ID), updated);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.lists() });
  });
});

describe("useDeleteNode", () => {
  it("calls submitDeleteNodeById, removes the detail cache, and invalidates lists on success", async () => {
    mockSubmitDeleteNodeById.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = createWrapper();
    const removeSpy = jest.spyOn(queryClient, "removeQueries");
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteNode(), { wrapper: Wrapper });
    result.current.mutate(NODE_ID);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitDeleteNodeById).toHaveBeenCalledWith(NODE_ID);
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.detail(NODE_ID) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.lists() });
  });
});

describe("useCreateLink", () => {
  it("calls submitCreateLink and invalidates both node details on success", async () => {
    const linkResult = { outgoingIds: [TARGET_ID], incomingIds: [] };
    mockSubmitCreateLink.mockResolvedValue(linkResult as never);
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateLink(), { wrapper: Wrapper });
    result.current.mutate({ nodeId: NODE_ID, targetNodeId: TARGET_ID });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitCreateLink).toHaveBeenCalledWith(NODE_ID, TARGET_ID);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.detail(NODE_ID) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.detail(TARGET_ID) });
  });
});

describe("useDeleteLink", () => {
  it("calls submitDeleteLink and invalidates both node details on success", async () => {
    const linkResult = { outgoingIds: [], incomingIds: [] };
    mockSubmitDeleteLink.mockResolvedValue(linkResult as never);
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteLink(), { wrapper: Wrapper });
    result.current.mutate({ nodeId: NODE_ID, targetNodeId: TARGET_ID });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSubmitDeleteLink).toHaveBeenCalledWith(NODE_ID, TARGET_ID);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.detail(NODE_ID) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeKeys.detail(TARGET_ID) });
  });
});
