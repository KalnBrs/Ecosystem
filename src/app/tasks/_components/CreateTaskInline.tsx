"use client"
import { useEffect, useRef, useState } from "react"
import styles from "../tasks.module.css"

import type { EnergyLevel } from "@/@types"
import { useKeyPress } from "@/_hooks/useKeyPress"

type Props = {
  onSave: (draft: CreateTaskDraft, options?: { openEditor?: boolean}) => void,
  onCancel: () => void
}

const energyOptions: EnergyLevel[] = ["deep", "light", "quick"]

export type CreateTaskDraft = {
  title: string
  energyLevel: EnergyLevel
}

export default function CreateTaskInline({ onSave, onCancel }: Props) {
  const [title, setTitle] = useState("")
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("light")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (openEditor = false) => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({ title: trimmed, energyLevel }, { openEditor })
  }

  useKeyPress({ key: "Escape" }, onCancel)

  useKeyPress({ key: "Enter" }, () => {
    handleSubmit()
  })

  useKeyPress({ key: "Enter", shiftKey: true}, () => {
    handleSubmit(true)
  })

  return (
    <div className={styles.createTask}>
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to get done?"
        className={styles.createTaskInput}
      />
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-3">
          {energyOptions.map(option => (
            <button
              key={option}
              onClick={() => setEnergyLevel(option)}
              className={`${styles.createTaskEnergy} ${energyLevel === option ? styles.createTaskEnergyActive : ""}`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <p className={`text-xs ${styles.timeText}`}>Enter to save · Esc to cancel · Shift + Enter to save and open</p>
      </div>
    </div>
  )
}
