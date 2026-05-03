import { Node, NodeType, NodeStatus } from "./Node";

/**
 * Represents a project node — a container that groups related tasks and other nodes.
 * Progress is derived from the completion state of its child tasks.
 */
export class Project extends Node {
  /**
   * @param id - Unique identifier inherited from {@link Node}.
   * @param title - Display title of the project.
   * @param description - Human-readable description.
   * @param createdAt - Creation timestamp.
   * @param updatedAt - Last-updated timestamp.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels.
   * @param linkedNodeIds - IDs of related nodes (populated at read time).
   * @param status - Lifecycle status.
   * @param startDate - Optional date the project starts.
   * @param targetDate - Optional deadline for the project.
   * @param projectStatus - Current workflow state; defaults to `"active"`.
   * @param progress - Completion percentage (0–100) derived from child tasks; defaults to `0`.
   * @param childNodeIds - IDs of nodes contained within this project; defaults to `[]`.
   */
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
    super(id, title, description, "project", createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}
