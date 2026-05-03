import { Node, NodeStatus } from "./Node";

/**
 * Represents an area of responsibility — a broad category used to group
 * projects and other nodes.
 */
export class Area extends Node {
  /**
   * @param id - Unique identifier inherited from {@link Node}.
   * @param title - Display title of the area.
   * @param description - Human-readable description.
   * @param createdAt - Creation timestamp.
   * @param updatedAt - Last-updated timestamp.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels.
   * @param linkedNodeIds - IDs of related nodes (populated at read time).
   * @param status - Lifecycle status.
   * @param color - Optional hexadecimal color string (e.g. `#FF5733`).
   * @param childNodeIds - IDs of nodes contained within this area; defaults to `[]`.
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
    color?: string,
    public childNodeIds: string[] = []
  ) {
    super(id, title, description, "area", createdAt, updatedAt, userId, tags, linkedNodeIds, status, color);
  }
}
