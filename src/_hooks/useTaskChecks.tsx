import { useCallback, useEffect, useRef, useState } from "react";
import { useUpdateNode } from "@/queries/nodeQueries";
import { TaskData } from "@/app/tasks/_components/TaskElement";

// Give the user a window to undo an accidental check before it's persisted.
export const UNDO_WINDOW_MS = 4000;

type PendingUpdate = { taskId: string; completed: boolean } | null;

export function useTaskChecks(initilizedCheckedValue: boolean = false) {
  const [isChecked, setChecked] = useState<boolean>(initilizedCheckedValue);
  const [isPendingUndo, setPendingUndo] = useState(false);
  const { mutate: updateNode } = useUpdateNode();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingUpdate>(null);

  const commitPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingRef.current) {
      updateNode({
        nodeId: pendingRef.current.taskId,
        data: { type: "task", data: { completed: pendingRef.current.completed } },
      });
      pendingRef.current = null;
    }
    setPendingUndo(false);
  }, [updateNode]);


  const toggleCheckedStatus = (task: TaskData) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const nextChecked = !isChecked;
    setChecked(nextChecked);
    setPendingUndo(true);
    pendingRef.current = { taskId: task.id, completed: nextChecked };

    timeoutRef.current = setTimeout(commitPending, UNDO_WINDOW_MS);
  };

  const undo = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingRef.current = null;
    setChecked((previous) => !previous);
    setPendingUndo(false);
  };

  // Flush any still-pending toggle instead of silently dropping it on unmount.
  useEffect(() => commitPending, [commitPending]);

  return [isChecked, toggleCheckedStatus, { isPendingUndo, undo }] as const;
}