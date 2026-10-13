import React from 'react'

import componentStyles from "./TaskEditWindow.module.css"

type Props = {
  children: React.ReactNode,
  label?: string
}

export default function Row({children, label} : Props) {
  return (
    <div className={componentStyles.row}>
      {label != null ? <p>{label}</p> : ""}
      {children}
    </div>
  )
}