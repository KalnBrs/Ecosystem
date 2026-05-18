import z from "zod";
import { NodeStatus } from "@/generated/prisma";

const BaseNode = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  userId: z.uuid(),
  status: z.enum(Object.keys(NodeStatus) as [keyof typeof NodeStatus, ...string[]]),
  tags: z.string().array().default([]),
});

// ─── Task ───────────────────────────────────────────────────────────────────

export const TaskSchema = BaseNode.extend({
  type: z.literal("task"),
  data: z.object({
    completed: z.boolean().default(false),
    dueDate: z.iso.datetime().optional(),
    energyLevel: z.enum(["deep", "light", "quick"]).optional(),
    isMorningPick: z.boolean().default(false),
    lastTouchedAt: z.iso.datetime().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    actualDuration: z.number().int().nonnegative().default(0),
    projectId: z.uuid().optional(),
    splitFromTaskId: z.uuid().optional(),
  }),
});

export const UpdateTaskSchema = z.object({
  type: z.literal("task"),
}).merge(BaseNode.partial()).extend({
  data: TaskSchema.shape.data.partial().optional(),
});

// ─── Event ──────────────────────────────────────────────────────────────────

export const EventSchema = BaseNode.extend({
  type: z.literal("event"),
  data: z.object({
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    isAllDay: z.boolean().default(false),
    location: z.string().optional(),
  }),
});

export const UpdateEventSchema = z.object({
  type: z.literal("event"),
}).merge(BaseNode.partial()).extend({
  data: EventSchema.shape.data.partial().optional(),
});

// ─── Idea ────────────────────────────────────────────────────────────────────

export const IdeaSchema = BaseNode.extend({
  type: z.literal("idea"),
  data: z.object({
    content: z.string().default(""),
    pinned: z.boolean().default(false),
  }),
});

export const UpdateIdeaSchema = z.object({
  type: z.literal("idea"),
}).merge(BaseNode.partial()).extend({
  data: IdeaSchema.shape.data.partial().optional(),
});

// ─── Project ─────────────────────────────────────────────────────────────────

export const ProjectSchema = BaseNode.extend({
  type: z.literal("project"),
  data: z.object({
    startDate: z.iso.datetime().optional(),
    targetDate: z.iso.datetime().optional(),
    projectStatus: z.enum(["active", "paused", "completed"]).default("active"),
    progress: z.number().int().min(0).max(100).default(0),
    childNodeIds: z.uuid().array().default([]),
  }),
});

export const UpdateProjectSchema = z.object({
  type: z.literal("project"),
}).merge(BaseNode.partial()).extend({
  data: ProjectSchema.shape.data.partial().optional(),
});

// ─── Union ───────────────────────────────────────────────────────────────────

export const CreateNodeSchema = z.discriminatedUnion("type", [
  TaskSchema,
  EventSchema,
  IdeaSchema,
  ProjectSchema,
]);

export const UpdateNodeSchema = z.discriminatedUnion("type", [
  UpdateTaskSchema.required({ type: true }),
  UpdateEventSchema.required({ type: true }),
  UpdateIdeaSchema.required({ type: true }),
  UpdateProjectSchema.required({ type: true }),
]);

export type CreateNodeInput = z.infer<typeof CreateNodeSchema>;
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;
