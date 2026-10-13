type AuthAlertProps = {
  message: string
  tone?: "error" | "success"
}

export default function AuthAlert({ message, tone = "error" }: AuthAlertProps) {
  const color = tone === "error" ? "text-destructive border-destructive" : "text-success border-success"

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border bg-muted px-3 py-2 text-sm ${color}`}
    >
      {message}
    </div>
  )
}
