"use client"
import { useState } from "react"
import { createPortal } from "react-dom"

import styles from "./ScheduleModal.module.css"
import { fromDateInputValue, toDateInputValue } from "../TaskEditWindow/taskEdit.utils"

import { useUpdateNode } from "@/queries/nodeQueries"
import type { TaskData } from "@/@types"
import { useKeyPress } from "@/_hooks/useKeyPress"

type Props = {
  task: TaskData
  anchor: DOMRect
  onClose: () => void
}

const GAP = 8
const POPOVER_HEIGHT = 200

export default function ScheduleModal({ task, anchor, onClose }: Props) {
  const { mutate: updateNode } = useUpdateNode()
  const [date, setDate] = useState(toDateInputValue(task.dueDate))

  useKeyPress({ key: "Escape" }, onClose)

  // Right-aligned to the button; flips above it when there's no room below.
  const opensAbove = anchor.bottom + GAP + POPOVER_HEIGHT > window.innerHeight
  const position = {
    right: window.innerWidth - anchor.right,
    ...(opensAbove ? { bottom: window.innerHeight - anchor.top + GAP } : { top: anchor.bottom + GAP }),
  }

  const commit = (value: string) => {
    updateNode({ nodeId: task.id, data: { type: "task", data: { dueDate: fromDateInputValue(value) } } })
    onClose()
  }

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${opensAbove ? styles.above : ""}`} style={position} role="dialog" aria-label="Schedule task">
        <p className="text-lg font-bold">Schedule</p>
        <p className={`text-sm ${styles.subtitle}`}>{task.title}</p>

        <input
          type="date"
          autoFocus
          value={date}
          onChange={e => setDate(e.target.value)}
          onKeyDown={e => e.key === "Enter" && date && commit(date)}
          className={styles.input}
        />

        <div className={styles.actions}>
          {task.dueDate && (
            <button onClick={() => commit("")} className={styles.clear}>
              Clear
            </button>
          )}
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => commit(date)} disabled={!date} className={styles.save}>
            Save
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
