import prisma from "@/lib/prisma";
import { Task } from "@/lib/models/Task";
import { Event } from "@/lib/models/Event";
import { Idea } from "@/lib/models/Idea";
import { Project } from "@/lib/models/Project";
import { Node, NodeStatus } from "@/lib/models/Node";
import { CreateNodeInput, UpdateNodeInput } from "@/lib/schemas/node.schema";
import { NodeType, NodeStatus as PrismaNodeStatus } from "@/generated/prisma";

// ─── Prisma include shared across all reads ───────────────────────────────────

const nodeLinksInclude = {
  outgoingLinks: { select: { targetNodeId: true } },
  incomingLinks: { select: { sourceNodeId: true } },
} as const;

// ─── Hydration ────────────────────────────────────────────────────────────────

type PrismaNodeRow = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: string[];
  status: string;
  data: unknown;
  outgoingLinks: { targetNodeId: string }[];
  incomingLinks: { sourceNodeId: string }[];
};

function hydrateNode(row: PrismaNodeRow): Node {
  const outgoing = row.outgoingLinks.map((l) => l.targetNodeId);
  const incoming = row.incomingLinks.map((l) => l.sourceNodeId);
  const data = (row.data ?? {}) as Record<string, unknown>;
  const status = row.status as NodeStatus;

  switch (row.type) {
    case "task":
      return new Task(
        row.id, row.title, row.description ?? "", row.createdAt, row.updatedAt,
        row.userId, row.tags, outgoing, incoming, status,
        Boolean(data.completed),
        data.dueDate != null ? new Date(data.dueDate as string) : undefined,
        data.energyLevel as "deep" | "light" | "quick" | undefined,
        Boolean(data.isMorningPick),
        data.lastTouchedAt != null ? new Date(data.lastTouchedAt as string) : undefined,
        data.estimatedDuration as number | undefined,
        data.actualDuration as number | undefined,
        data.projectId as string | undefined,
        data.splitFromTaskId as string | undefined,
      );
    case "event":
      return new Event(
        row.id, row.title, row.description ?? "", row.createdAt, row.updatedAt,
        row.userId, row.tags, outgoing, incoming, status,
        new Date(data.startTime as string),
        new Date(data.endTime as string),
        Boolean(data.isAllDay),
        data.location as string | undefined,
      );
    case "idea":
      return new Idea(
        row.id, row.title, row.description ?? "", row.createdAt, row.updatedAt,
        row.userId, row.tags, outgoing, incoming, status,
        (data.content as string) ?? "",
        Boolean(data.pinned),
      );
    case "project":
      return new Project(
        row.id, row.title, row.description ?? "", row.createdAt, row.updatedAt,
        row.userId, row.tags, outgoing, incoming, status,
        data.startDate != null ? new Date(data.startDate as string) : undefined,
        data.targetDate != null ? new Date(data.targetDate as string) : undefined,
        (data.projectStatus as "active" | "paused" | "completed") ?? "active",
        (data.progress as number) ?? 0,
        (data.childNodeIds as string[]) ?? [],
      );
    default:
      throw new Error(`Unknown node type: ${row.type}`);
  }
}

// ─── Service methods ──────────────────────────────────────────────────────────

export async function createNode(input: CreateNodeInput, userId: string): Promise<Node> {
  const { type, data, title, description, status, tags } = input;

  const row = await prisma.node.create({
    data: {
      type: type as NodeType,
      title,
      description: description ?? null,
      status: status as PrismaNodeStatus,
      tags: tags ?? [],
      data: data as object,
      userId,
    },
    include: nodeLinksInclude,
  });

  return hydrateNode(row);
}

export async function getNodeById(id: string, userId: string): Promise<Node | null> {
  const row = await prisma.node.findFirst({
    where: { id, userId },
    include: nodeLinksInclude,
  });

  if (!row) return null;
  return hydrateNode(row);
}

export async function listNodes(userId: string, type: NodeType): Promise<Node[]> {
  const rows = await prisma.node.findMany({
    where: {
      userId,
      type,
      status: { not: PrismaNodeStatus.deleted },
    },
    include: nodeLinksInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(hydrateNode);
}

export async function updateNode(
  id: string,
  userId: string,
  input: UpdateNodeInput,
): Promise<Node | null> {
  const existing = await prisma.node.findFirst({ where: { id, userId } });
  if (!existing) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: newData, type: _type, userId: _userId, status, ...otherBaseFields } = input as UpdateNodeInput & { userId?: string; status?: string };

  const mergedData =
    newData != null
      ? { ...(existing.data as Record<string, unknown>), ...newData }
      : existing.data;

  const row = await prisma.node.update({
    where: { id },
    data: {
      ...otherBaseFields,
      ...(status != null ? { status: status as PrismaNodeStatus } : {}),
      data: mergedData as object,
    },
    include: nodeLinksInclude,
  });

  return hydrateNode(row);
}

export async function deleteNode(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.node.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.node.update({
    where: { id },
    data: { status: PrismaNodeStatus.deleted },
  });

  return true;
}

// ─── Link management ─────────────────────────────────────────────────────────

type LinkResult = { outgoingIds: string[]; incomingIds: string[] };

// Shared: re-fetch the source node's current link arrays after a write.
async function fetchLinkResult(sourceNodeId: string): Promise<LinkResult> {
  const node = await prisma.node.findUniqueOrThrow({
    where: { id: sourceNodeId },
    include: nodeLinksInclude,
  });
  return {
    outgoingIds: node.outgoingLinks.map((l) => l.targetNodeId),
    incomingIds: node.incomingLinks.map((l) => l.sourceNodeId),
  };
}

export async function createLink(
  sourceNodeId: string,
  targetNodeId: string,
  userId: string,
): Promise<LinkResult | null> {
  // Verify the caller owns the source node before writing any link.
  const sourceNode = await prisma.node.findFirst({ where: { id: sourceNodeId, userId } });
  if (!sourceNode) return null;

  // upsert handles the @@unique([sourceNodeId, targetNodeId]) constraint gracefully —
  // creating the link if it doesn't exist, doing nothing if it already does.
  await prisma.nodeLink.upsert({
    where: { sourceNodeId_targetNodeId: { sourceNodeId, targetNodeId } },
    create: { sourceNodeId, targetNodeId },
    update: {},
  });

  return fetchLinkResult(sourceNodeId);
}

export async function deleteLink(
  sourceNodeId: string,
  targetNodeId: string,
  userId: string,
): Promise<LinkResult | null> {
  // Verify the caller owns the source node before deleting any link.
  const sourceNode = await prisma.node.findFirst({ where: { id: sourceNodeId, userId } });
  if (!sourceNode) return null;

  await prisma.nodeLink.deleteMany({ where: { sourceNodeId, targetNodeId } });

  return fetchLinkResult(sourceNodeId);
}