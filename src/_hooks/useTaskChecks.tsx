import { useUpdateNode } from "@/queries/nodeQueries";
import type { TaskData } from "@/@types";
import { useUndoableValue } from "./useUndoableValue";

export { UNDO_WINDOW_MS } from "./useUndoableValue";

export function useTaskChecks(initilizedCheckedValue: boolean = false) {
  const { mutate: updateNode } = useUpdateNode();
  const { value: pendingUpdate, isPending: isPendingUndo, schedule, undo, commit } = useUndoableValue(
    { taskId: "", completed: initilizedCheckedValue },
    ({ taskId, completed }) => {
      if (taskId) updateNode({ nodeId: taskId, data: { type: "task", data: { completed } } });
    },
  );
  const isChecked = pendingUpdate.completed;

  const toggleCheckedStatus = (task: TaskData) => {
    schedule({ taskId: task.id, completed: !isChecked });
  };

  return [isChecked, toggleCheckedStatus, { isPendingUndo, undo, commit }] as const;
}