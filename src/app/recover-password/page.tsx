import { notFound } from "next/navigation"
import { Suspense } from "react"

import { isRecoveryEnabled } from "@/lib/devRecovery"
import RecoverPasswordForm from "./RecoverPasswordForm"

export const metadata = { title: "Recover password | Ecosystem" }

export default function RecoverPasswordPage() {
  if (!isRecoveryEnabled()) notFound()

  return (
    <Suspense>
      <RecoverPasswordForm />
    </Suspense>
  )
}
