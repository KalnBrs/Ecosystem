import { Node, NodeStatus } from "./Node";
import { RecurrenceRule } from "@/@types";

/**
 * Represents a task node — a discrete unit of work that can be scheduled,
 * prioritised, and optionally made recurring.
 */
export class Task extends Node {
  /**
   * @param id - Unique identifier inherited from {@link Node}.
   * @param title - Display title of the task.
   * @param description - Human-readable description.
   * @param createdAt - Creation timestamp.
   * @param updatedAt - Last-updated timestamp.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels.
   * @param outgoingLinkedNodeIds - IDs of nodes this node links to (populated at read time).
   * @param incomingLinkedNodeIds - IDs of nodes that link to this node (populated at read time).
   * @param status - Lifecycle status.
   * @param dueDate - Optional date/time by which the task should be completed.
   * @param priority - Importance level; defaults to `"medium"`.
   * @param completed - Whether the task has been completed; defaults to `false`.
   * @param recurrenceRule - Optional rule defining how the task repeats.
   * @param estimatedDuration - Estimated time to complete, in minutes.
   * @param actualDuration - Actual time spent on the task, in minutes.
   * @param projectId - ID of the parent project, if any.
   */
  constructor(
    id: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    tags: string[],
    outgoingLinkedNodeIds: string[],
    incomingLinkedNodeIds: string[],
    status: NodeStatus,
    public dueDate?: Date,
    public priority: "low" | "medium" | "high" = "medium",
    public completed: boolean = false,
    public recurrenceRule?: RecurrenceRule,
    public estimatedDuration?: number, // In minutes
    public actualDuration?: number, // In minutes
    public projectId?: string
  ) {
    super(id, title, description, "task", createdAt, updatedAt, userId, tags, outgoingLinkedNodeIds, incomingLinkedNodeIds, status);
  }
}