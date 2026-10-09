"use client"
import { useMemo, useState } from "react"
import Image from "next/image"

import styles from "../tasks.module.css"

import Toast from "@/_components/Toast"
import TaskEditWindow from "./TaskEditWindow"
import ScheduleModal from "./ScheduleModal"
import DeleteModel from "./DeleteModal"

import { useTaskChecks, UNDO_WINDOW_MS } from "@/_hooks/useTaskChecks"
import { useUndoableValue } from "@/_hooks/useUndoableValue"
import { useDeleteNode } from "@/queries/nodeQueries"
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
  const { mutate: deleteNode } = useDeleteNode()
  
  const { isPending: isPendingDelete, schedule: scheduleDelete, undo: undoDelete } = useUndoableValue(
    false,
    pending => pending && deleteNode(task.id),
  )
  
  const energy = task.energyLevel

  const [now] = useState(() => Date.now())
  const [scheduleAnchor, setScheduleAnchor] = useState<DOMRect | null>(null)
  const [deleteAnchor, setDeleteAnchor] = useState<DOMRect | null>(null)
  

  const timeAgo = useMemo(() => {
    if (!task.updatedAt) return null
    const days = Math.round((new Date(task.updatedAt).getTime() - now) / (1000 * 60 * 60 * 24))
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day")
  }, [task.updatedAt, now])

  // Due dates are stored as UTC midnight, so format in UTC to avoid a day shift.
  const dueLabel = useMemo(() => (
      task.dueDate ? new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }) : null
    ), [task.dueDate]
  )

  // Both sides are calendar dates (due date is UTC midnight, today is local), so the diff is whole days.
  const dueStatus = useMemo(() => {
    if (!task.dueDate || isChecked) {
      return null
    } 

    const daysLeft = (Date.parse(task.dueDate.slice(0, 10)) - Date.parse(new Date(now).toLocaleDateString("sv"))) / 86_400_000

    if (daysLeft < 0) {
      return "overdue"
    }  else {
      return daysLeft < 3 ? "soon" : null
    }
  }, [task.dueDate, isChecked, now])

  const dueClass = dueStatus === "overdue" ? styles.overdue : dueStatus === "soon" ? styles.dueSoon : ""

  return (
    <div
      className={`${styles.node} ${scheduleAnchor || deleteAnchor ? styles.nodeActive : ""} flex items-center gap-3 px-4 cursor-pointer m-1`}
      onClick={() => onSelect(task.id)}
    >
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
        <div className="flex flex-row items-center gap-2">
          {timeAgo && <p className={`text-xs ${styles.timeText}`}>{timeAgo}</p>}
          {task.projectId && (
            <p className={`text-xs leading-none ${styles.timeText} flex flex-row items-center`}>
              <Image aria-hidden src="/folder.svg" alt="" width={10} height={10} className="changeIconColorStatic mr-1 shrink-0" />
              {task.projectId}
            </p>
          )}
          {dueLabel && (
            <div className={`text-xs leading-none ${styles.timeText} ${dueClass} flex flex-row items-center`}>
              <span
                aria-hidden
                className={`${styles.maskIcon} mr-1`}
                style={{ maskImage: "url(/calendar-minus.svg)", WebkitMaskImage: "url(/calendar-minus.svg)" }}
              />
              <p className="pt-px"> Due {dueLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.actions} flex flex-row gap-4 px-1 `} onClick={e => e.stopPropagation()}>
        <button
          className={styles.calendar}
          onClick={e => setScheduleAnchor(e.currentTarget.getBoundingClientRect())}
          aria-label="Schedule"
        >
          <Image src="/calendar-minus.svg" alt="Calendar" width={15} height={15} className="changeIconColor" />
        </button>

        <button className={styles.startButton}>
          Start
          <Image src="/arrow-small-right.svg" alt="" width={15} height={15} style={{ filter: "brightness(0) invert(1)" }} />
        </button>

        <button onClick={e => setDeleteAnchor(e.currentTarget.getBoundingClientRect())} aria-label="Open Delete">
          <Image src="/menu-dots.svg" alt="More options" width={12} height={12} className="changeIconColor" />
        </button>
      </div>

      {energy && (
        <p className={`${styles.energyLevel} ${energyColorClass[energy]} p-1 px-2 text-xs font-bold`}>{energyLabels[energy]}</p>
      )}

      {isPendingUndo && (
        <div onClick={e => e.stopPropagation()} className={styles.toastContainer}>
          <Toast
            message={isChecked ? "Task marked complete" : "Task marked incomplete"}
            actionLabel="Undo"
            onAction={undo}
            durationMs={UNDO_WINDOW_MS}
          />
        </div>
      )}

      {isPendingDelete && (
        <div onClick={e => e.stopPropagation()} className={styles.toastContainer}>
          <Toast
            message="Task deleted"
            actionLabel="Undo"
            onAction={undoDelete}
            durationMs={UNDO_WINDOW_MS}
          />
        </div>
      )}

      {scheduleAnchor && (
        <div onClick={e => e.stopPropagation()} className="hidden">
          <ScheduleModal task={task} anchor={scheduleAnchor} onClose={() => setScheduleAnchor(null)} />
        </div>
      )}

      {deleteAnchor && (
        <div onClick={e => e.stopPropagation()} className="hidden">
          <DeleteModel
            anchor={deleteAnchor}
            onClose={() => setDeleteAnchor(null)}
            onConfirm={() => scheduleDelete(true)}
          />
        </div>
      )}

      {isSelected && (
        <div onClick={e => e.stopPropagation()} className="hidden">
          <TaskEditWindow
            task={task}
            projects={projects}
            onClose={onClose}
            onMarkDone={() => !isChecked && toggleCheckedStatus(task)}
            onDelete={() => scheduleDelete(true)}
          />
        </div>
      )}
    </div>
  )
}
