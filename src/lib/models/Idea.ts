import { Node, NodeStatus } from "./Node";

/**
 * Represents an idea node — a freeform note with rich-text content
 * that can be pinned for quick access.
 */
export class Idea extends Node {
  /**
   * @param id - Unique identifier inherited from {@link Node}.
   * @param title - Display title of the idea.
   * @param description - Brief summary of the idea.
   * @param createdAt - Creation timestamp.
   * @param updatedAt - Last-updated timestamp.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels.
   * @param linkedNodeIds - IDs of related nodes (populated at read time).
   * @param status - Lifecycle status.
   * @param content - Rich-text body of the idea.
   * @param pinned - Whether the idea is pinned for quick access; defaults to `false`.
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
    public content: string, // Rich text
    public pinned: boolean = false
  ) {
    super(id, title, description, "idea", createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}
