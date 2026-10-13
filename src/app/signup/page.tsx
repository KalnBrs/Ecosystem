import { Suspense } from "react"

import SignupForm from "./SignupForm"

export const metadata = { title: "Sign up | Ecosystem" }

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
