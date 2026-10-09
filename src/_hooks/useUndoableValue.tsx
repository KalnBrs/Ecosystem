import { useCallback, useEffect, useRef, useState } from "react"

export const UNDO_WINDOW_MS = 4000

/**
 * Keeps a value updated optimistically while allowing the pending change to be undone.
 * Commits the latest scheduled value after the delay, or immediately when `commit` is called.
 *
 * @param initialValue the starting value and value restored by `undo`
 * @param onCommit called with the scheduled value after the undo window expires
 * @param durationMs undo window in milliseconds; defaults to `UNDO_WINDOW_MS`
 * @returns current value, pending state, and methods to schedule, undo, or commit the change
 */
export function useUndoableValue<T>(
  initialValue: T,
  onCommit: (value: T) => void,
  durationMs = UNDO_WINDOW_MS,
) {
  const [value, setValue] = useState(initialValue)
  const [isPending, setIsPending] = useState(false)
  const previousValueRef = useRef<T>(initialValue)
  const pendingValueRef = useRef<T>(initialValue)
  const hasPendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const commit = useCallback(() => {
    clearTimer()
    const pendingValue = pendingValueRef.current
    const hasPending = hasPendingRef.current
    hasPendingRef.current = false
    setIsPending(false)
    if (hasPending) onCommitRef.current(pendingValue)
  }, [clearTimer])

  const schedule = useCallback((nextValue: T) => {
    clearTimer()
    if (!hasPendingRef.current) previousValueRef.current = value
    pendingValueRef.current = nextValue
    hasPendingRef.current = true
    setValue(nextValue)
    setIsPending(true)
    timerRef.current = setTimeout(commit, durationMs)
  }, [clearTimer, commit, durationMs, value])

  const undo = useCallback(() => {
    clearTimer()
    hasPendingRef.current = false
    setValue(previousValueRef.current)
    setIsPending(false)
  }, [clearTimer])

  useEffect(() => () => {
    clearTimer()
    const pendingValue = pendingValueRef.current
    const hasPending = hasPendingRef.current
    hasPendingRef.current = false
    if (hasPending) onCommitRef.current(pendingValue)
  }, [clearTimer])

  return { value, isPending, schedule, undo, commit }
}
