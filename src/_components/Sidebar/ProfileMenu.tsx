"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"

export default function ProfileMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: "/login" })
  }

  const name = session?.user.name || "Account"
  const email = session?.user.email

  return (
    <div ref={containerRef} className="relative w-36 min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="flex w-full flex-row items-center gap-2 rounded-md p-1 text-left hover:bg-muted"
      >
        <span className="shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 p-0.5 shadow-sm">
          <Image src={session?.user.image ?? "/default-avatar.svg"} alt="Profile picture" width={30} height={30} className="rounded-full object-cover" />
        </span>
        <span className="truncate text-sm">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{name}</p>
            {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-muted disabled:opacity-60"
          >
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  )
}
