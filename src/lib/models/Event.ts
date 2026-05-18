import { Node, NodeStatus } from "./Node";

/**
 * Represents a calendar event node with a defined time window.
 */
export class Event extends Node {
  /**
   * @param id - Unique identifier inherited from {@link Node}.
   * @param title - Display title of the event.
   * @param description - Human-readable description.
   * @param createdAt - Creation timestamp.
   * @param updatedAt - Last-updated timestamp.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels.
   * @param outgoingLinkedNodeIds - IDs of nodes this node links to (populated at read time).
   * @param incomingLinkedNodeIds - IDs of nodes that link to this node (populated at read time).
   * @param status - Lifecycle status.
   * @param startTime - When the event begins.
   * @param endTime - When the event ends.
   * @param isAllDay - Whether the event spans the entire day; defaults to `false`.
   * @param location - Optional physical or virtual location string.
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
    public startTime: Date,
    public endTime: Date,
    public isAllDay: boolean = false,
    public location?: string
  ) {
    super(id, title, description, "event", createdAt, updatedAt, userId, tags, outgoingLinkedNodeIds, incomingLinkedNodeIds, status);
  }
}