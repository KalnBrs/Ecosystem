"use client"

import { InputHTMLAttributes, useId, useState } from "react"

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string
  error?: string
}

export default function AuthField({ label, error, type, className, ...inputProps }: AuthFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === "password"

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 w-full rounded-md border bg-input px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 ${
            error ? "border-destructive" : "border-border"
          } ${isPassword ? "pr-14" : ""} ${className ?? ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(value => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
