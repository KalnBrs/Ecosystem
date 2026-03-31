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
    /**
     * Derived at read time by JOINing the `node_links` table.
     * Never persisted in `nodes.data` — the join table is the single source of truth.
     * NodeService is responsible for populating this field on every read.
     */
    public linkedNodeIds: string[],
    public status: NodeStatus
  ) {}
}