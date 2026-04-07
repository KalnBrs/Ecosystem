import { Node, NodeStatus } from "./Node";
import { RecurrenceRule } from "@/@types";

export class Task extends Node {
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
    public dueDate?: Date,
    public priority: "low" | "medium" | "high" = "medium",
    public completed: boolean = false,
    public recurrenceRule?: RecurrenceRule,
    public estimatedDuration?: number, // In minutes
    public actualDuration?: number, // In minutes
    public projectId?: string
  ) {
    super(id, title, description, "task", createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}