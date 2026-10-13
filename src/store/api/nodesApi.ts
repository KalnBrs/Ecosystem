import type { CreateNodeInput, UpdateNodeInput } from "@/lib/schemas/node.schema";
import { Node, NodeType } from "@/lib/models"

export type LinkResult = { outgoingIds: string[]; incomingIds: string[] };

export async function submitListNodes(type?: NodeType): Promise<Node[]> {
  const url = type ? `/api/nodes?type=${type}` : "/api/nodes";
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function submitGetNodeById(id: string): Promise<Node> {
  const res = await fetch(`/api/nodes/${id}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function submitCreateNode(data: CreateNodeInput): Promise<Node> {
  const res = await fetch("/api/nodes", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data: node } = await res.json();
  return node;
}

export async function submitUpdateNodeById(id: string, data: UpdateNodeInput): Promise<Node> {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data: node } = await res.json();
  return node;
}

export async function submitDeleteNodeById(id: string): Promise<void> {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }
  // 204 No Content — no body to parse
}

export async function submitCreateLink(id: string, targetNodeId: string): Promise<LinkResult> {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetNodeId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function submitDeleteLink(id: string, targetNodeId: string): Promise<LinkResult> {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetNodeId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}