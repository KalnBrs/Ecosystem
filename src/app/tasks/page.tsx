"use client"
import { useMemo, useState } from "react"
import Image from "next/image"

import styles from "./tasks.module.css"

import TaskElement from "./_components/TaskElement"
import CreateTaskInline, { CreateTaskDraft } from "./_components/CreateTaskInline"
import { useCreateNode, useNodes } from "@/queries/nodeQueries"

import { toTaskData, selectActiveTasks, filterTasks, EnergyFilter } from "./tasks.util"

const energyFilters: EnergyFilter[] = ["all", "deep", "light", "quick"]

export default function Home() {
  const { data: allNodes = [], isLoading, isError, error } = useNodes()
  const { mutate: createNode } = useCreateNode()

  const [energyFilter, setEnergyFilter] = useState<EnergyFilter>("all")
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const tasks = useMemo(() => selectActiveTasks(allNodes), [allNodes])

  const handleCreateTask = (draft: CreateTaskDraft, options?: { openEditor?: boolean}) => {
    createNode({
      type: "task",
      title: draft.title,
      status: "active",
      tags: [],
      description: "",
      data: { completed: false, energyLevel: draft.energyLevel, isMorningPick: false, actualDuration: 0 },
    }, { onSuccess: node => options?.openEditor && setSelectedTaskId(node.id) })
    setIsCreatingTask(false)
  }

  const projectTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const node of allNodes) {
      if (node.type === "project") map.set(node.id, node.title)
    }
    return map
  }, [allNodes])

  const projects = useMemo(
    () =>
      allNodes
        .filter(node => node.type === "project" && node.status === "active")
        .map(node => ({ id: node.id, title: node.title })),
    [allNodes]
  )

  const projectIds = useMemo(() => {
    const ids = new Set<string>()
    for (const task of tasks) {
      if (task.projectId) ids.add(task.projectId)
    }
    return Array.from(ids)
  }, [tasks])

  const filteredTasks = useMemo(
    () => filterTasks(tasks, energyFilter, projectFilter),
    [tasks, energyFilter, projectFilter]
  )

  return (
    <div className="flex flex-col mx-24 my-10 gap-3 flex-1 min-h-0">
      <div className="flex flex-row justify-between items-center w-full shrink-0">
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
        <div className="flex flex-row gap-1 shrink-0">
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

      <div className={`${styles.taskListScroll} flex flex-col flex-1 min-h-0`}>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : isError ? (
          <p className={`text-sm ${styles.timeText}`}>{error instanceof Error ? error.message : "Something went wrong"}</p>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskElement
              key={task.id}
              task={toTaskData(task)}
              projects={projects}
              isSelected={task.id === selectedTaskId}
              onSelect={setSelectedTaskId}
              onClose={() => setSelectedTaskId(null)}
            />
          ))
        ) : (
          <p className={`text-sm ${styles.timeText}`}>No tasks</p>
        )}

        {isCreatingTask ? (
          <CreateTaskInline onSave={handleCreateTask} onCancel={() => setIsCreatingTask(false)} />
        ) : (
          <button className={styles.addTask} onClick={() => setIsCreatingTask(true)}>
            <span className={styles.plusIcon}>+</span>
            Add task
          </button>
        )}
      </div>
    </div>
  )
}