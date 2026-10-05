export type EnergyLevel = "deep" | "light" | "quick"

// Serialized view of a Task (dates as ISO strings) shared by the tasks UI and its hooks.
export type TaskData = {
  id: string
  title: string
  description: string
  userId: string
  tags: string[]
  status: string
  completed: boolean
  createdAt: string
  updatedAt: string
  isMorningPick: boolean
  dueDate?: string
  energyLevel?: EnergyLevel
  projectId?: string
  estimatedDuration?: number
  actualDuration?: number
}
