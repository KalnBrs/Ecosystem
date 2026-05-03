export type NodeType = "task" | "event" | "project" | "note" | "idea" | "area" | "custom";
export type NodeStatus = "active" | "archived" | "deleted";

/**
 * Base class representing a node in the ecosystem graph.
 * Every content item (task, event, project, idea, area, etc.) extends this class.
 */
export class Node {
  /**
   * @param id - Unique identifier for the node.
   * @param title - Display title of the node.
   * @param description - Human-readable description of the node.
   * @param type - The structural type of the node.
   * @param createdAt - Timestamp when the node was created.
   * @param updatedAt - Timestamp of the most recent update.
   * @param userId - ID of the owning user.
   * @param tags - Arbitrary string labels attached to the node.
   * @param linkedNodeIds - IDs of related nodes, derived at read time by JOINing
   *   the `node_links` table; never persisted in `nodes.data`.
   * @param status - Lifecycle status of the node.
   * @param color - Optional hexadecimal color string (e.g. `#FF5733`).
   */
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
    public status: NodeStatus,
    public color?: string
  ) {}
}