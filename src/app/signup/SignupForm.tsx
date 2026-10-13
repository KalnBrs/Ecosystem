"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { AuthAlert, AuthField, AuthLayout, AuthSubmitButton, PasswordChecklist, getSafeCallbackUrl } from "@/_components/Auth"
import { isStrongPassword } from "@/lib/passwordRules"

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mirrors the limits enforced by POST /api/auth/users.
function validate(name: string, email: string, password: string, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {}
  if (name.length < 4) errors.name = "Name must be at least 4 characters."
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address."
  if (!isStrongPassword(password)) errors.password = "Password doesn't meet all the requirements below."
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match."
  return errors
}

async function readMessage(response: Response): Promise<string | null> {
  try {
    const body = await response.json()
    return typeof body?.message === "string" ? body.message : null
  } catch {
    return null
  }
}

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"))

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [password, setPassword] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    const errors = validate(name, email, password, confirmPassword)
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length > 0) return

    setPending(true)
    try {
      const response = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        if (response.status === 409) setError("An account with this name or email already exists.")
        else if (response.status === 400) setError("Please check your details and try again.")
        else if (response.status === 429) setError("Too many attempts. Please wait a moment and try again.")
        else setError((await readMessage(response)) ?? "Could not create your account. Please try again.")
        setPending(false)
        return
      }

      const result = await signIn("credentials", { email, password, redirect: false })
      if (!result || result.error) {
        router.replace(`/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setPending(false)
    }
  }

  const loginHref = callbackUrl === "/tasks" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Capture, plan and focus in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-accent hover:text-accent-hover">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <AuthAlert message={error} />}

        <AuthField label="Name" name="name" type="text" autoComplete="name" placeholder="Your name" error={fieldErrors.name} required autoFocus />
        <AuthField label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={fieldErrors.email} required />
        <div className="flex flex-col gap-2">
          <AuthField label="Password" name="password" type="password" autoComplete="new-password" placeholder="Create a strong password" value={password} onChange={event => setPassword(event.target.value)} error={fieldErrors.password} required />
          <PasswordChecklist password={password} />
        </div>
        <AuthField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" error={fieldErrors.confirmPassword} required />

        <AuthSubmitButton label="Create account" pendingLabel="Creating account…" pending={pending} />
      </form>
    </AuthLayout>
  )
}
