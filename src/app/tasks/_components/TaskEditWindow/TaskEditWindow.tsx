"use client"
import { createPortal } from "react-dom"
import Image from "next/image"

import componentStyles from "./TaskEditWindow.module.css"
import pageStyles from "../../tasks.module.css"

import type { EnergyLevel, TaskData } from "@/@types"
import Row from "./Row"

import { useTaskEditor } from "@/_hooks/useTaskEditor"
import { useEscapeKey } from "@/_hooks/useEscapeKey"

import { toDateInputValue, fromDateInputValue, energyOptions } from "./taskEdit.utils"

const energyColorClass: Record<EnergyLevel, string> = {
  deep: pageStyles.energyDeep,
  light: pageStyles.energyLight,
  quick: pageStyles.energyQuick,
}

type Props = {
  task: TaskData
  projects: { id: string; title: string }[]
  onClose: () => void
  onMarkDone: () => void
}

export default function TaskEditWindow({ task, projects, onClose, onMarkDone }: Props) {
  const [createdLabel, save, handleDelete, DraftState, CommitEdit] = useTaskEditor({task, onClose})
  useEscapeKey(onClose);

  return createPortal(
    <>
      <div className={componentStyles.backdrop} onClick={onClose} />
      <div className={`${componentStyles.window} flex flex-col`}>
        <div className={`${componentStyles.row} mb-6`}>
          {task.energyLevel ? (
            <div className={`${pageStyles.energyLevel} ${energyColorClass[task.energyLevel]} p-1 px-2 text-xs font-bold uppercase`}>
              {task.energyLevel}
            </div>
          ) : (
            <div />
          )}
          <button onClick={onClose} aria-label="Close">
            <Image src="/x-symbol.svg" alt="close" width={10} height={10} style={{ filter: "var(--icon-hover)" }} />
          </button>
        </div>

        <input
          value={DraftState.title}
          onChange={e => DraftState.setTitle(e.target.value)}
          onBlur={CommitEdit.commitTitle}
          onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
          maxLength={255}
          placeholder="Task title"
          className="text-2xl mt-10 w-full bg-transparent outline-none"
        />
        <textarea
          value={DraftState.description}
          onChange={e => DraftState.setDescription(e.target.value)}
          onBlur={CommitEdit.commitDescription}
          placeholder="Add a description, notes, or links..."
          className="mt-4 field-sizing-content w-full max-h-70 resize-none text-muted-foreground text-sm outline-none"
        />

        <hr className="mt-10 mb-4" />

        <Row label="Energy" >
          <div className="flex gap-3">
            {energyOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => task.energyLevel !== value && save({ data: { energyLevel: value } })}
                className={task.energyLevel === value ? componentStyles.optionActive : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Project">
          <select
            value={task.projectId ?? ""}
            onChange={e => save({ data: { projectId: e.target.value || null } })}
            className={componentStyles.input}
          >
            <option value="">None</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Due">
          <input
            type="date"
            value={toDateInputValue(task.dueDate)}
            onChange={e => save({ data: { dueDate: fromDateInputValue(e.target.value) } })}
            className={`${componentStyles.input} ${componentStyles.dateInput}`}
          />
        </Row>

        <Row label="Estimate (min)">
          <input
            type="number"
            min={1}
            step={1}
            value={DraftState.estimate}
            onChange={e => DraftState.setEstimate(e.target.value)}
            onBlur={CommitEdit.commitEstimate}
            className={`${componentStyles.input} w-20`}
          />
        </Row>

        <Row label="Status">
          <button
            onClick={() => {
              onMarkDone()
              onClose()
            }}
          >
            Mark as done
          </button>
        </Row>

        <Row label="Morning 3">
          <button
            onClick={() => save({ data: { isMorningPick: !task.isMorningPick } })}
            className={task.isMorningPick ? componentStyles.optionActive : undefined}
          >
            {task.isMorningPick ? "Picked for today" : "Pick for today"}
          </button>
        </Row>

        <hr className="mt-10" />

        <Row>
          <p className={`${componentStyles.row} gap-2 changeIconColor text-center`}>
            <Image src="/calendar-minus.svg" alt="Calendar" width={15} height={15} className="changeIconColor" />
            Created {createdLabel}
          </p>

          <button onClick={handleDelete} className={`${componentStyles.delete} ${componentStyles.row} gap-0.5 text-center `}>
            <Image src="/trashcan.svg" alt="Calendar" width={20} height={20} className={componentStyles.deleteImg} />
            Delete
          </button>
        </Row>
      </div>
    </>,
    document.body,
  )
}
