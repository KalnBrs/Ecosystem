"use client"
import { useEffect, useRef, useState } from "react"
import styles from "../tasks.module.css"
import { useEscapeKey } from "@/_hooks/useEscapeKey"

import type { EnergyLevel } from "@/@types"

type Props = {
  onSave: (draft: CreateTaskDraft) => void,
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

  useEscapeKey(onCancel);

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({ title: trimmed, energyLevel })
  }

  const handleSubmitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } 
  }

  return (
    <div className={styles.createTask}>
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleSubmitKeyDown}
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
        <p className={`text-xs ${styles.timeText}`}>Enter to save · Esc to cancel</p>
      </div>
    </div>
  )
}
