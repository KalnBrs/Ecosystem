"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"

import Sidebar from "@/_components/Sidebar"
import { AUTH_ROUTES } from "@/_components/Auth/authRoutes"

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (AUTH_ROUTES.includes(pathname)) {
    return <div className="flex h-screen overflow-hidden">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 m-10 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}
