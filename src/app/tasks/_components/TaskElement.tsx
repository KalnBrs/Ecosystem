"use client"
import { useMemo, useState } from "react"
import Image from "next/image"
import styles from "../tasks.module.css"

type EnergyLevel = "deep" | "light" | "quick"

export type TaskData = {
  id: string
  title: string
  description: string
  userId: string
  tags: string[]
  status: string
  completed: boolean
  updatedAt: string
  dueDate?: string
  energyLevel?: EnergyLevel
  projectId?: string
  estimatedDuration?: number
  actualDuration?: number
}

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

export default function TaskElement({ task }: { task: TaskData }) {
  const [checked, setChecked] = useState(task.completed)
  const energy = task.energyLevel

  const [now] = useState(() => Date.now())

  const timeAgo = useMemo(() => {
    if (!task.updatedAt) return null
    const days = Math.round((new Date(task.updatedAt).getTime() - now) / (1000 * 60 * 60 * 24))
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day")
  }, [task.updatedAt, now])

  return (
    <div className={`${styles.node} flex items-center gap-3 px-4`}>
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => setChecked(prev => !prev)}
        className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ""} shrink-0`}
      />

      <div className="flex-1">
        <p className={`text-md ${checked ? "line-through opacity-50" : ""}`}>{task.title}</p>
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

      <div className={`${styles.actions} flex flex-row gap-4 px-1 `}>
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
    </div>
  )
}
