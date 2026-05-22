import { Node, NodeStatus } from "./Node";

/**
 * Represents a task node — a discrete unit of work that can be scheduled
 * and focused on. Uses energy level (deep / light / quick) instead of
 * priority levels.
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
   * @param completed - Whether the task has been completed; defaults to `false`.
   * @param dueDate - Optional date/time by which the task should be completed.
   * @param energyLevel - Energy required: `"deep"` (focus block), `"light"` (low-effort), or `"quick"` (under 5 min).
   * @param isMorningPick - Whether this task was selected as one of today's Morning 3; defaults to `false`.
   * @param lastTouchedAt - Timestamp of the last edit or focus session start; used by anti-procrastination triggers.
   * @param estimatedDuration - Estimated time to complete, in minutes.
   * @param actualDuration - Accumulated time spent across all focus sessions, in minutes.
   * @param projectId - ID of the parent project, if any.
   * @param splitFromTaskId - ID of the original task this was split from via "Too big? Split it", if applicable.
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
    public completed: boolean = false,
    public dueDate?: Date,
    public energyLevel?: "deep" | "light" | "quick",
    public isMorningPick: boolean = false,
    public lastTouchedAt?: Date,
    public estimatedDuration?: number,
    public actualDuration?: number,
    public projectId?: string,
    public splitFromTaskId?: string
  ) {
    super(id, title, description, "task", createdAt, updatedAt, userId, tags, outgoingLinkedNodeIds, incomingLinkedNodeIds, status);
  }
}