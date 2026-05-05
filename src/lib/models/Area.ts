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
   * @param outgoingLinkedNodeIds - IDs of nodes this node links to (populated at read time).
   * @param incomingLinkedNodeIds - IDs of nodes that link to this node (populated at read time).
   * @param status - Lifecycle status.
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
    outgoingLinkedNodeIds: string[],
    incomingLinkedNodeIds: string[],
    status: NodeStatus,
    public childNodeIds: string[] = []
  ) {
    super(id, title, description, "area", createdAt, updatedAt, userId, tags, outgoingLinkedNodeIds, incomingLinkedNodeIds, status);
  }
}
