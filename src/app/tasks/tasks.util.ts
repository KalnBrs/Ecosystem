import type { Task } from "@/lib/models"
import type { TaskData } from "@/@types"

// The diffrent types of energy for the tasks page
export type EnergyFilter = "all" | "deep" | "light" | "quick"

/**
 * Converts Task object into a TaskData object
 * @param task the task that is being converted to convert to a TaskData object
 * @returns the converted TaskData Object
 */
export function toTaskData(task: Task): TaskData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    userId: task.userId,
    tags: task.tags,
    status: task.status,
    completed: task.completed,
    updatedAt: new Date(task.updatedAt).toISOString(),
    createdAt: new Date(task.createdAt).toISOString(),
    isMorningPick: task.isMorningPick,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    energyLevel: task.energyLevel,
    projectId: task.projectId,
    estimatedDuration: task.estimatedDuration,
    actualDuration: task.actualDuration,
  }
}