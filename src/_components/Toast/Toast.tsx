"use client"
import styles from "./Toast.module.css"

type ToastProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  durationMs: number
}

export default function Toast({ message, actionLabel, onAction, durationMs }: ToastProps) {
  return (
    <div className={styles.toast} role="status">
      <span className={styles.message}>{message}</span>
      {actionLabel && onAction && (
        <button className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <div className={styles.progress} style={{ animationDuration: `${durationMs}ms` }} />
    </div>
  )
}
