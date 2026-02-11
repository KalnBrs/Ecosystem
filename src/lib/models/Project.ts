import { Node, NodeType, NodeStatus } from "./Node";

export class Project extends Node {
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
    public startDate?: Date,
    public targetDate?: Date,
    public projectStatus: "active" | "paused" | "completed" = "active",
    public progress: number = 0, // 0-100, derived from child tasks
    public childNodeIds: string[] = []
  ) {
    super(id, title, description, "project" as NodeType, createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}
