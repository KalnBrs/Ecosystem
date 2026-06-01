import { NodeType } from "@/generated/prisma";
import { Node } from "@/lib/models";

export type LinkResult = { outgoingIds: string[]; incomingIds: string[] };

export async function listNodes(type?: NodeType): Promise<Node[]> {
  const url = type ? `/api/nodes?type=${type}` : "/api/nodes";
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function getNodeById(id: string): Promise<Node> {
  const res = await fetch(`/api/nodes/${id}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function createNode(data: object): Promise<Node> {
  const res = await fetch("/api/nodes", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data: node } = await res.json();
  return node;
}

export async function updateNodeById(id: string, data: object): Promise<Node> {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data: node } = await res.json();
  return node;
}

export async function deleteNodeById(id: string): Promise<void> {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }
  // 204 No Content — no body to parse
}

export async function createLink(id: string, targetNodeId: string): Promise<LinkResult> {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetNodeId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}

export async function deleteLink(id: string, targetNodeId: string): Promise<LinkResult> {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetNodeId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const { data } = await res.json();
  return data;
}