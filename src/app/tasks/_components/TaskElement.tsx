"use client"
import { useEffect, useMemo, useState } from "react"
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

  const [now, setNow] = useState(() => Date.now())
  const [scheduleAnchor, setScheduleAnchor] = useState<DOMRect | null>(null)
  const [deleteAnchor, setDeleteAnchor] = useState<DOMRect | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNextMidnight = () => {
      const currentTime = Date.now()
      const nextMidnight = new Date(currentTime)
      nextMidnight.setHours(24, 0, 0, 0)

      timeoutId = setTimeout(() => {
        setNow(Date.now())
        scheduleNextMidnight()
      }, nextMidnight.getTime() - currentTime)
    }

    scheduleNextMidnight()
    return () => clearTimeout(timeoutId)
  }, [])
  

  const timeAgo = useMemo(() => {
    if (!task.updatedAt) return null
    const days = Math.round((new Date(task.updatedAt).getTime() - now) / (1000 * 60 * 60 * 24))
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day")
  }, [task.updatedAt, now])

  // Due dates are stored as UTC midnight; compare calendar dates to avoid timezone shifts.
  const dueLabel = useMemo(() => {
    if (!task.dueDate) return null

    const dueDay = Date.parse(task.dueDate.slice(0, 10))
    const today = new Date(now)
    const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const daysFromToday = (dueDay - todayDay) / 86_400_000

    if (daysFromToday >= -1 && daysFromToday <= 1) {
      const relativeLabel = new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(daysFromToday, "day")
      return relativeLabel.charAt(0).toUpperCase() + relativeLabel.slice(1)
    }

    return new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })
  }, [task.dueDate, now])

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
        aria-label={isChecked ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
        onClick={e => {
          e.stopPropagation()
          toggleCheckedStatus(task)
        }}
        className={`${styles.checkbox} ${isChecked ? styles.checkboxChecked : ""} shrink-0`}
      />

      <button
        type="button"
        aria-label={`Edit task: ${task.title}`}
        aria-expanded={isSelected}
        onClick={e => {
          e.stopPropagation()
          onSelect(task.id)
        }}
        className={`${styles.editTrigger} flex-1 text-left cursor-pointer`}
      >
        <span className={`block text-md ${isChecked ? "line-through opacity-50" : ""}`}>{task.title}</span>
        <span className="flex flex-row items-center gap-2">
          {timeAgo && <span className={`text-xs ${styles.timeText}`}>{timeAgo}</span>}
          {task.projectId && (
            <span className={`text-xs leading-none ${styles.timeText} flex flex-row items-center`}>
              <Image aria-hidden src="/folder.svg" alt="" width={10} height={10} className="changeIconColorStatic mr-1 shrink-0" />
              {projects.find(project => project.id === task.projectId)?.title ?? task.projectId}
            </span>
          )}
          {dueLabel && (
            <span className={`text-xs leading-none ${styles.timeText} ${dueClass} flex flex-row items-center`}>
              <span
                aria-hidden
                className={`${styles.maskIcon} mr-1`}
                style={{ maskImage: "url(/calendar-minus.svg)", WebkitMaskImage: "url(/calendar-minus.svg)" }}
              />
              <span className="pt-px"> Due {dueLabel}</span>
            </span>
          )}
        </span>
      </button>

      <div className={`${styles.actions} flex flex-row gap-4 px-1 `} onClick={e => e.stopPropagation()}>
        <button
          className={styles.calendar}
          onClick={e => setScheduleAnchor(e.currentTarget.getBoundingClientRect())}
          aria-label="Schedule"
        >
          <Image src="/calendar-minus.svg" alt="Calendar" width={15} height={15} className="changeIconColor" />
        </button>

        {/* <button className={styles.startButton}> Hidden until the focus feature is added
          Start
          <Image src="/arrow-small-right.svg" alt="" width={15} height={15} style={{ filter: "brightness(0) invert(1)" }} />
        </button> */}

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
