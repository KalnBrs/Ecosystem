"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { AuthAlert, AuthField, AuthLayout, AuthSubmitButton, getSafeCallbackUrl } from "@/_components/Auth"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"))
  const justRegistered = searchParams.get("registered") === "1"
  const justReset = searchParams.get("reset") === "1"

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const formData = new FormData(event.currentTarget)
    setError(null)
    setPending(true)

    try {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      })

      if (!result || result.error) {
        setError("Incorrect email or password.")
        setPending(false)
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setPending(false)
    }
  }

  const signupHref = callbackUrl === "/tasks" ? "/signup" : `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New to Ecosystem?{" "}
          <Link href={signupHref} className="font-medium text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {justRegistered && !error && (
          <AuthAlert tone="success" message="Account created. Log in to continue." />
        )}
        {justReset && !error && (
          <AuthAlert tone="success" message="Password updated. Log in with your new password." />
        )}
        {error && <AuthAlert message={error} />}

        <AuthField label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus />
        <AuthField label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" required />
        {process.env.NODE_ENV !== "production" && (
          <Link href={callbackUrl === "/tasks" ? "/recover-password" : `/recover-password?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="-mt-2 self-end text-xs text-accent hover:text-accent-hover">
            Forgot password?
          </Link>
        )}

        <AuthSubmitButton label="Log in" pendingLabel="Logging in…" pending={pending} />
      </form>
    </AuthLayout>
  )
}
