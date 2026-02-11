import { Node, NodeType, NodeStatus } from "./Node";
import { RecurrenceRule } from "@/@types";

export class Event extends Node {
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