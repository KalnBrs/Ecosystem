"use client"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import styles from "./tasks.module.css"
import TaskElement, { TaskData } from "./_components/TaskElement"
import type { AppDispatch } from "@/store/store"
import { fetchNodes, selectActiveTasks, selectAllNodes, selectNodesError, selectNodesStatus } from "@/store/slices/nodeSlice"
import type { Task } from "@/lib/models"

type EnergyFilter = "all" | "deep" | "light" | "quick"

const energyFilters: EnergyFilter[] = ["all", "deep", "light", "quick"]

function toTaskData(task: Task): TaskData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    userId: task.userId,
    tags: task.tags,
    status: task.status,
    completed: task.completed,
    updatedAt: new Date(task.updatedAt).toISOString(),
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    energyLevel: task.energyLevel,
    projectId: task.projectId,
    estimatedDuration: task.estimatedDuration,
    actualDuration: task.actualDuration,
  }
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const status = useSelector(selectNodesStatus)
  const error = useSelector(selectNodesError)
  const tasks = useSelector(selectActiveTasks)
  const allNodes = useSelector(selectAllNodes)

  const [energyFilter, setEnergyFilter] = useState<EnergyFilter>("all")
  const [projectFilter, setProjectFilter] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchNodes())
  }, [dispatch])

  const projectTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const node of allNodes) {
      if (node.type === "project") map.set(node.id, node.title)
    }
    return map
  }, [allNodes])

  const projectIds = useMemo(() => {
    const ids = new Set<string>()
    for (const task of tasks) {
      if (task.projectId) ids.add(task.projectId)
    }
    return Array.from(ids)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (energyFilter !== "all" && task.energyLevel !== energyFilter) return false
      if (projectFilter && task.projectId !== projectFilter) return false
      return true
    })
  }, [tasks, energyFilter, projectFilter])

  const isLoading = status === "loading"

  return (
    <div className="flex flex-col mx-24 my-10 gap-3">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="text-2xl font-bold">Tasks</p>
        <div className="flex flex-row gap-2">
          {energyFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setEnergyFilter(filter)}
              className={`${styles.filterButton} ${energyFilter === filter ? styles.filterButtonActive : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {projectIds.length > 0 && (
        <div className="flex flex-row gap-1">
          <button
            onClick={() => setProjectFilter(null)}
            className={`${styles.projectTab} ${projectFilter === null ? styles.projectTabActive : ""}`}
          >
            All projects
          </button>
          {projectIds.map(projectId => (
            <button
              key={projectId}
              onClick={() => setProjectFilter(projectId)}
              className={`${styles.projectTab} ${projectFilter === projectId ? styles.projectTabActive : ""}`}
            >
              <Image src="/folder.svg" alt="" width={14} height={14} className="changeIconColorStatic" />
              {projectTitleById.get(projectId) ?? projectId}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {isLoading ? (
          <p className={`text-sm ${styles.timeText}`}>Loading tasks...</p>
        ) : error ? (
          <p className={`text-sm ${styles.timeText}`}>{error}</p>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskElement key={task.id} task={toTaskData(task)} />
          ))
        ) : (
          <p className={`text-sm ${styles.timeText}`}>No tasks</p>
        )}
      </div>

      <button className={styles.addTask}>
        <span className={styles.plusIcon}>+</span>
        Add task
      </button>
    </div>
  )
}