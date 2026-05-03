import { Node, NodeStatus } from "./Node";
import { RecurrenceRule } from "@/@types";

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
   * @param linkedNodeIds - IDs of related nodes (populated at read time).
   * @param status - Lifecycle status.
   * @param startTime - When the event begins.
   * @param endTime - When the event ends.
   * @param isAllDay - Whether the event spans the entire day; defaults to `false`.
   * @param location - Optional physical or virtual location string.
   * @param recurrenceRule - Optional rule defining how the event repeats.
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
    public startTime: Date,
    public endTime: Date,
    public isAllDay: boolean = false,
    public location?: string,
    public recurrenceRule?: RecurrenceRule
  ) {
    super(id, title, description, "event", createdAt, updatedAt, userId, tags, linkedNodeIds, status);
  }
}