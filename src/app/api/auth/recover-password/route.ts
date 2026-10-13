import z from "zod";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { resetPassword } from "@/services/AuthService";
import { isStrongPassword } from "@/lib/passwordRules";
import { isRecoveryEnabled } from "@/lib/devRecovery";

/**
 * POST /api/auth/recover-password
 *
 * Development-only: sets a new password for an account by email, with no
 * verification step. Returns `404` in production.
 *
 * @returns `200` on success; `400` for invalid input; `404` if disabled or
 *   no account has that email.
 */
export async function POST(request: Request) {
  if (!isRecoveryEnabled()) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  try {
    const parsed = z
      .object({ email: z.email(), password: z.string().refine(isStrongPassword) })
      .safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 })
    }

    const { email, password } = parsed.data
    const updated = await resetPassword(email, await bcrypt.hash(password, 10))

    if (!updated) {
      return NextResponse.json({ message: "No account found with this email" }, { status: 404 })
    }

    return NextResponse.json({ message: "Password updated" }, { status: 200 })
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ message: "An error occurred while resetting the password: " + detail }, { status: 500 })
  }
}
