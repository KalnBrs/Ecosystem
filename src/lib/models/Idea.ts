import { Node, NodeType, NodeStatus } from "./Node";

export class Idea extends Node {
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
    public content: string, // Rich text
    public pinned: boolean = false
  ) {
    super(id, title, description, "idea" as NodeType, createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}
