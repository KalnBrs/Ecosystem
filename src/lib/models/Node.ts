export type NodeType = "task" | "event" | "project" | "note" | "idea" | "custom";
export type NodeStatus = "active" | "archived" | "deleted";

export class Node {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public type: NodeType,
    public createdAt: Date,
    public updatedAt: Date,
    public userId: string,
    public tags: string[],
    public linkedNodeIds: string[],
    public status: NodeStatus
  ) {}
}