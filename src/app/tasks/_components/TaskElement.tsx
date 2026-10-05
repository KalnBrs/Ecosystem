"use client"
import { useMemo, useState } from "react"
import Image from "next/image"

import styles from "../tasks.module.css"

import Toast from "@/_components/Toast"
import TaskEditWindow from "./TaskEditWindow"

import { useTaskChecks, UNDO_WINDOW_MS } from "@/_hooks/useTaskChecks"
import type { EnergyLevel, TaskData } from "@/@types"

const energyLabels: Record<EnergyLevel, string> = {
  deep: "DEEP",
  light: "LIGHT",
  quick: "QUICK",
}

const energyColorClass: Record<EnergyLevel, string> = {
  deep: styles.energyDeep,
  light: styles.energyLight,
  quick: styles.energyQuick,
}

type TaskElementProps = {
  task: TaskData
  projects: { id: string; title: string }[]
  isSelected: boolean
  onSelect: (taskId: string) => void
  onClose: () => void
}

export default function TaskElement({ task, projects, isSelected, onSelect, onClose }: TaskElementProps) {
  const [isChecked, toggleCheckedStatus, { isPendingUndo, undo }] = useTaskChecks(task.completed);
  const energy = task.energyLevel

  const [now] = useState(() => Date.now())

  const timeAgo = useMemo(() => {
    if (!task.updatedAt) return null
    const days = Math.round((new Date(task.updatedAt).getTime() - now) / (1000 * 60 * 60 * 24))
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day")
  }, [task.updatedAt, now])

  return (
    <div className={`${styles.node} flex items-center gap-3 px-4 cursor-pointer m-1`} onClick={() => onSelect(task.id)}>
      <button
        role="checkbox"
        aria-checked={isChecked}
        onClick={e => {
          e.stopPropagation()
          toggleCheckedStatus(task)
        }}
        className={`${styles.checkbox} ${isChecked ? styles.checkboxChecked : ""} shrink-0`}
      />

      <div className="flex-1">
        <p className={`text-md ${isChecked ? "line-through opacity-50" : ""}`}>{task.title}</p>
        <div className="flex flex-row gap-2">
          {timeAgo && <p className={`text-xs ${styles.timeText}`}>{timeAgo}</p>}
          {task.projectId && (
            <p className={`text-xs ${styles.timeText} flex flex-row items-center`}>
              <Image src="/folder.svg" alt="" width={10} height={10} className="changeIconColorStatic mr-1" />
              {task.projectId}
            </p>
          )}
        </div>
      </div>

      <div className={`${styles.actions} flex flex-row gap-4 px-1 `} onClick={e => e.stopPropagation()}>
        <button className={styles.calendar}>
          <Image src="/calendar-minus.svg" alt="Calendar" width={15} height={15} className="changeIconColor" />
        </button>

        <button className={styles.startButton}>
          Start
          <Image src="/arrow-small-right.svg" alt="" width={15} height={15} style={{ filter: "brightness(0) invert(1)" }} />
        </button>

        <button>
          <Image src="/menu-dots.svg" alt="More options" width={12} height={12} className="changeIconColor" />
        </button>
      </div>

      {energy && (
        <p className={`${styles.energyLevel} ${energyColorClass[energy]} p-1 px-2 text-xs font-bold`}>{energyLabels[energy]}</p>
      )}

      {isPendingUndo && (
        <div onClick={e => e.stopPropagation()}>
          <Toast
            message={isChecked ? "Task marked complete" : "Task marked incomplete"}
            actionLabel="Undo"
            onAction={undo}
            durationMs={UNDO_WINDOW_MS}
          />
        </div>
      )}

      {isSelected && (
        <div onClick={e => e.stopPropagation()}>
          <TaskEditWindow
            task={task}
            projects={projects}
            onClose={onClose}
            onMarkDone={() => !isChecked && toggleCheckedStatus(task)}
          />
        </div>
      )}
    </div>
  )
}
