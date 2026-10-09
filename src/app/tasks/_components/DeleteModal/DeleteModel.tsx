import { createPortal } from "react-dom";

import styles from "./DeleteModel.module.css"
import { useKeyPress } from "@/_hooks/useKeyPress";

type Props = {
  anchor: DOMRect
  onClose: () => void
  onConfirm: () => void
}

const GAP = 8
const POPOVER_HEIGHT = 200

export default function DeleteModel({ anchor, onClose, onConfirm }: Props) {
  useKeyPress({ key: "Escape" }, onClose)

  // Right-aligned to the button; flips above it when there's no room below.
  const opensAbove = anchor.bottom + GAP + POPOVER_HEIGHT > window.innerHeight
  const position = {
    right: window.innerWidth - anchor.right,
    ...(opensAbove ? { bottom: window.innerHeight - anchor.top + GAP } : { top: anchor.bottom + GAP }),
  }

  const commit = () => {
    onConfirm()
    onClose()
  }

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${opensAbove ? styles.above : ""}`} style={position} role="dialog" aria-label="Remove node">
        <button onClick={commit} className={styles.deleteColor}>Delete</button>
      </div>
    </>,
    document.body
  )
}