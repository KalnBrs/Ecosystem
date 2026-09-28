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
