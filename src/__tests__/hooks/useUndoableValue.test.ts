/**
 * useUndoableValue tests
 *
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useUndoableValue, UNDO_WINDOW_MS } from "@/_hooks/useUndoableValue";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useUndoableValue", () => {
  it("starts with the initial value and nothing pending", () => {
    const { result } = renderHook(() => useUndoableValue(false, jest.fn()));

    expect(result.current.value).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it("applies a scheduled value optimistically without committing yet", () => {
    const onCommit = jest.fn();
    const { result } = renderHook(() => useUndoableValue(false, onCommit));

    act(() => result.current.schedule(true));

    expect(result.current.value).toBe(true);
    expect(result.current.isPending).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits the scheduled value once the default window elapses", () => {
    const onCommit = jest.fn();
    const { result } = renderHook(() => useUndoableValue(false, onCommit));

    act(() => result.current.schedule(true));
    act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(onCommit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(true);
    expect(result.current.value).toBe(true);
    expect(result.current.isPending).toBe(false);
  });

  it("respects a custom duration", () => {
    const onCommit = jest.fn();
    const { result } = renderHook(() => useUndoableValue(0, onCommit, 500));

    act(() => result.current.schedule(1));
    act(() => jest.advanceTimersByTime(499));
    expect(onCommit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(onCommit).toHaveBeenCalledWith(1);
  });

  describe("undo", () => {
    it("restores the previous value and never commits", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue("a", onCommit));

      act(() => result.current.schedule("b"));
      act(() => result.current.undo());

      expect(result.current.value).toBe("a");
      expect(result.current.isPending).toBe(false);

      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS * 2));
      expect(onCommit).not.toHaveBeenCalled();
    });

    it("restores the original value after multiple schedules", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue(1, onCommit));

      act(() => result.current.schedule(2));
      act(() => result.current.schedule(3));
      act(() => result.current.undo());

      expect(result.current.value).toBe(1);
      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));
      expect(onCommit).not.toHaveBeenCalled();
    });

    it("does nothing harmful when nothing is pending", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue("a", onCommit));

      act(() => result.current.undo());

      expect(result.current.value).toBe("a");
      expect(result.current.isPending).toBe(false);
      expect(onCommit).not.toHaveBeenCalled();
    });
  });

  describe("rescheduling", () => {
    it("commits only the latest value and restarts the window", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue(1, onCommit));

      act(() => result.current.schedule(2));
      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS - 1000));
      act(() => result.current.schedule(3));

      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS - 1));
      expect(onCommit).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1));
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(3);
    });

    it("keeps the pre-pending value as the undo target after a commit", () => {
      const { result } = renderHook(() => useUndoableValue(1, jest.fn()));

      act(() => result.current.schedule(2));
      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));
      act(() => result.current.schedule(3));
      act(() => result.current.undo());

      expect(result.current.value).toBe(2);
    });
  });

  describe("commit", () => {
    it("commits immediately and cancels the timer", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue(false, onCommit));

      act(() => result.current.schedule(true));
      act(() => result.current.commit());

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(true);
      expect(result.current.isPending).toBe(false);

      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS * 2));
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it("does not call onCommit when nothing is pending", () => {
      const onCommit = jest.fn();
      const { result } = renderHook(() => useUndoableValue(false, onCommit));

      act(() => result.current.commit());

      expect(onCommit).not.toHaveBeenCalled();
    });
  });

  describe("onCommit handling", () => {
    it("calls the most recent onCommit callback", () => {
      const first = jest.fn();
      const second = jest.fn();
      const { result, rerender } = renderHook(
        ({ cb }) => useUndoableValue(false, cb),
        { initialProps: { cb: first } },
      );

      act(() => result.current.schedule(true));
      rerender({ cb: second });
      act(() => jest.advanceTimersByTime(UNDO_WINDOW_MS));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith(true);
    });
  });

  describe("unmount", () => {
    it("flushes a pending change instead of dropping it", () => {
      const onCommit = jest.fn();
      const { result, unmount } = renderHook(() => useUndoableValue(false, onCommit));

      act(() => result.current.schedule(true));
      unmount();

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(true);

      jest.advanceTimersByTime(UNDO_WINDOW_MS * 2);
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it("does not commit when nothing is pending or after undo", () => {
      const onCommit = jest.fn();
      const { result, unmount } = renderHook(() => useUndoableValue(false, onCommit));

      act(() => result.current.schedule(true));
      act(() => result.current.undo());
      unmount();

      expect(onCommit).not.toHaveBeenCalled();
    });
  });
});
