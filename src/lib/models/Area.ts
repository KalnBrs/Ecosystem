import { Node, NodeStatus } from "./Node";

export class Area extends Node {
  constructor(
    id: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    tags: string[],
    linkedNodeIds: string[],
    status: NodeStatus,
    color?: string,
    public childNodeIds: string[] = []
  ) {
    super(id, title, description, "area", createdAt, updatedAt, userId, tags, linkedNodeIds, status, color);
  }
}
