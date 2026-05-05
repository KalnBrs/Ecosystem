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
   * @param outgoingLinkedNodeIds - IDs of nodes this node links to, derived at read
   *   time by JOINing `node_links` where `source_node_id = this.id`; never persisted
   *   in `nodes.data`.
   * @param incomingLinkedNodeIds - IDs of nodes that link to this node, derived at
   *   read time by JOINing `node_links` where `target_node_id = this.id`; never
   *   persisted in `nodes.data`.
   * @param status - Lifecycle status of the node.
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
    public outgoingLinkedNodeIds: string[],
    public incomingLinkedNodeIds: string[],
    public status: NodeStatus,
  ) {}
}