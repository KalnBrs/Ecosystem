/**
 * useTaskChecks tests
 *
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useTaskChecks, UNDO_WINDOW_MS } from "@/_hooks/useTaskChecks";
import { useUpdateNode } from "@/queries/nodeQueries";
import type { TaskData } from "@/@types";

jest.mock("@/queries/nodeQueries", () => ({
  useUpdateNode: jest.fn(),
}));

const mutate = jest.fn();

const task: TaskData = {
  id: "task-1",
  title: "Write tests",
  description: "",
  userId: "user-1",
  tags: [],
  status: "todo",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isMorningPick: false,
};

beforeEach(() => {
  jest.useFakeTimers();
  (useUpdateNode as jest.Mock).mockReturnValue({ mutate });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useTaskChecks", () => {
  it("defaults to unchecked with nothing pending", () => {
    const { result } = renderHook(() => useTaskChecks());

    const [isChecked, , { isPendingUndo }] = result.current;
    expect(isChecked).toBe(false);
    expect(isPendingUndo).toBe(false);
  });

  it("uses the initial checked value", () => {
    const { result } = renderHook(() => useTaskChecks(true));

    expect(result.current[0]).toBe(true);
  });

  it("toggles optimistically without updating the node yet", () => {
    const { result } = renderHook(() => useTaskChecks(false));

    act(() => result.current[1](task));

    expect(result.current[0]).toBe(true);
    expect(result.current[2].isPendingUndo).toBe(true);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("updates the node after the undo window", () => {
    const { result } = renderHook(() => useTaskChecks(false));

    act(() => result.current[1](task));
    act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      nodeId: "task-1",
      data: { type: "task", data: { completed: true } },
    });
    expect(result.current[2].isPendingUndo).toBe(false);
  });

  it("sends completed false when unchecking a checked task", () => {
    const { result } = renderHook(() => useTaskChecks(true));

    act(() => result.current[1]({ ...task, completed: true }));
    act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));

    expect(mutate).toHaveBeenCalledWith({
      nodeId: "task-1",
      data: { type: "task", data: { completed: false } },
    });
  });

  it("restores the previous state and skips the update on undo", () => {
    const { result } = renderHook(() => useTaskChecks(false));

    act(() => result.current[1](task));
    act(() => result.current[2].undo());

    expect(result.current[0]).toBe(false);
    expect(result.current[2].isPendingUndo).toBe(false);

    act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("commits immediately via commit", () => {
    const { result } = renderHook(() => useTaskChecks(false));

    act(() => result.current[1](task));
    act(() => result.current[2].commit());

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(true);
  });

  it("does not update the node when nothing was toggled", () => {
    const { result } = renderHook(() => useTaskChecks(false));

    act(() => result.current[2].commit());

    expect(mutate).not.toHaveBeenCalled();
  });

  it("flushes a pending toggle on unmount", () => {
    const { result, unmount } = renderHook(() => useTaskChecks(false));

    act(() => result.current[1](task));
    unmount();

    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
