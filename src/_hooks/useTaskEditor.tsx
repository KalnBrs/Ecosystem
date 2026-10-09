import type { TaskData } from "@/@types";
import { useMemo, useState } from "react";
import { useUpdateNode } from "@/queries/nodeQueries";
import { UpdateNodeInput } from "@/lib/schemas/node.schema";

type Props = {
  task: TaskData;
  onClose: () => void;
  onDelete: () => void;
}

type TaskUpdate = Extract<UpdateNodeInput, { type: "task" }>

export function useTaskEditor({task, onClose, onDelete} : Props) {
  const { mutate: updateNode } = useUpdateNode()
  
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [estimate, setEstimate] = useState(task.estimatedDuration?.toString() ?? "")

  const createdLabel = useMemo(() => new Date(task.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }), [task.createdAt]); 

  const save = (patch: Omit<TaskUpdate, "type">) => {
    updateNode({ nodeId: task.id, data: { type: "task", ...patch } })
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  const commitTitle = () => {
    const next = title.trim()
    if (!next) return setTitle(task.title)
    if (next !== task.title) save({ title: next })
  }

  const commitDescription = () => {
    if (description !== task.description) save({ description })
  }

  const commitEstimate = () => {
    const minutes = estimate.trim() === "" ? null : Number(estimate)
    if (minutes !== null && (!Number.isInteger(minutes) || minutes <= 0)) {
      return setEstimate(task.estimatedDuration?.toString() ?? "")
    }
    if (minutes !== (task.estimatedDuration ?? null)) save({ data: { estimatedDuration: minutes } })
  }

  
  return [createdLabel, save, handleDelete, { title, setTitle, description, setDescription, estimate, setEstimate }, {commitTitle, commitDescription, commitEstimate}] as const
}