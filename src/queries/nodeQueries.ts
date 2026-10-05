import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateNodeInput, UpdateNodeInput } from "@/lib/schemas/node.schema";
import type { Node, NodeType } from "@/lib/models";
import {
  submitListNodes,
  submitGetNodeById,
  submitCreateNode,
  submitUpdateNodeById,
  submitDeleteNodeById,
  submitCreateLink,
  submitDeleteLink,
} from "@/store/api/nodesApi";

export const nodeKeys = {
  all: ["nodes"] as const,
  lists: () => [...nodeKeys.all, "list"] as const,
  list: (type?: NodeType) => [...nodeKeys.lists(), type ?? "all"] as const,
  details: () => [...nodeKeys.all, "detail"] as const,
  detail: (id: string) => [...nodeKeys.details(), id] as const,
};

// Mirrors the server's merge so the UI reflects an edit before the round trip finishes; null clears a field.
function applyUpdate(node: Node, input: UpdateNodeInput): Node {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type: _type, data, ...base } = input;
  const flatData = Object.fromEntries(
    Object.entries(data ?? {}).map(([key, value]) => [
      key,
      value === null ? undefined : key === "dueDate" || key === "lastTouchedAt" ? new Date(value as string) : value,
    ]),
  );
  return Object.assign(Object.create(Object.getPrototypeOf(node)), node, base, flatData) as Node;
}

export function useNodes(type?: NodeType) {
  return useQuery({
    queryKey: nodeKeys.list(type),
    queryFn: () => submitListNodes(type),
  });
}

export function useNode(id: string) {
  return useQuery({
    queryKey: nodeKeys.detail(id),
    queryFn: () => submitGetNodeById(id),
    enabled: Boolean(id),
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNodeInput) => submitCreateNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: UpdateNodeInput }) =>
      submitUpdateNodeById(nodeId, data),
    onMutate: async ({ nodeId, data }) => {
      await queryClient.cancelQueries({ queryKey: nodeKeys.all });
      const snapshot = queryClient.getQueriesData<Node | Node[]>({ queryKey: nodeKeys.all });
      const apply = (node: Node) => (node.id === nodeId ? applyUpdate(node, data) : node);
      queryClient.setQueriesData<Node[]>({ queryKey: nodeKeys.lists() }, (old) => old?.map(apply));
      queryClient.setQueryData<Node>(nodeKeys.detail(nodeId), (old) => (old ? apply(old) : old));
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      context?.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (updatedNode: Node) => {
      queryClient.setQueryData(nodeKeys.detail(updatedNode.id), updatedNode);
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => submitDeleteNodeById(nodeId),
    onMutate: async (nodeId) => {
      await queryClient.cancelQueries({ queryKey: nodeKeys.lists() });
      const snapshot = queryClient.getQueriesData<Node[]>({ queryKey: nodeKeys.lists() });
      queryClient.setQueriesData<Node[]>({ queryKey: nodeKeys.lists() }, (old) =>
        old?.filter((node) => node.id !== nodeId),
      );
      return { snapshot };
    },
    onError: (_error, _nodeId, context) => {
      context?.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (_data, nodeId) => {
      queryClient.removeQueries({ queryKey: nodeKeys.detail(nodeId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, targetNodeId }: { nodeId: string; targetNodeId: string }) =>
      submitCreateLink(nodeId, targetNodeId),
    onSuccess: (_result, { nodeId, targetNodeId }) => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(nodeId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(targetNodeId) });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, targetNodeId }: { nodeId: string; targetNodeId: string }) =>
      submitDeleteLink(nodeId, targetNodeId),
    onSuccess: (_result, { nodeId, targetNodeId }) => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(nodeId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(targetNodeId) });
    },
  });
}
