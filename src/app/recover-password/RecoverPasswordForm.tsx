"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { AuthAlert, AuthField, AuthLayout, AuthSubmitButton, getSafeCallbackUrl, PasswordChecklist } from "@/_components/Auth"
import { isStrongPassword } from "@/lib/passwordRules"

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>

export default function RecoverPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"))
  const loginHref = callbackUrl === "/tasks" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [password, setPassword] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const newPassword = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    const errors: FieldErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address."
    if (!isStrongPassword(newPassword)) errors.password = "Password doesn't meet all the requirements below."
    else if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match."
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length > 0) return

    setPending(true)
    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      })

      if (!response.ok) {
        if (response.status === 404) setError("No account found with this email.")
        else if (response.status === 400) setError("Please check your details and try again.")
        else if (response.status === 429) setError("Too many attempts. Please wait a moment and try again.")
        else setError("Could not reset your password. Please try again.")
        setPending(false)
        return
      }

      const next = new URLSearchParams({ reset: "1" })
      if (callbackUrl !== "/tasks") next.set("callbackUrl", callbackUrl)
      router.replace(`/login?${next.toString()}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Recover your password"
      subtitle="Enter your account email and choose a new password."
      footer={
        <Link href={loginHref} className="font-medium text-accent hover:text-accent-hover">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          Development only: no email verification. This page is disabled in production.
        </p>
        {error && <AuthAlert message={error} />}

        <AuthField label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={fieldErrors.email} required autoFocus />
        <div className="flex flex-col gap-2">
          <AuthField label="New password" name="password" type="password" autoComplete="new-password" placeholder="Create a strong password" value={password} onChange={event => setPassword(event.target.value)} error={fieldErrors.password} required />
          <PasswordChecklist password={password} />
        </div>
        <AuthField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your new password" error={fieldErrors.confirmPassword} required />

        <AuthSubmitButton label="Reset password" pendingLabel="Resetting…" pending={pending} />
      </form>
    </AuthLayout>
  )
}
