import type { Node, Task } from "@/lib/models"
import type { TaskData } from "@/@types"

// The diffrent types of energy for the tasks page
export type EnergyFilter = "all" | "deep" | "light" | "quick"

/** Returns only active, incomplete task nodes. */
export function selectActiveTasks(nodes: Node[]): Task[] {
  return nodes.filter(
    (node): node is Task => node.type === "task" && node.status === "active" && !(node as Task).completed
  )
}

/** Filters tasks by energy level ("all" disables it) and optional project id. */
export function filterTasks(tasks: Task[], energyFilter: EnergyFilter, projectFilter: string | null = null): Task[] {
  return tasks.filter(task => {
    if (energyFilter !== "all" && task.energyLevel !== energyFilter) return false
    if (projectFilter && task.projectId !== projectFilter) return false
    return true
  })
}

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