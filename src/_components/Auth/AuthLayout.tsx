import { ReactNode } from "react"

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-center text-2xl font-bold text-accent">Ecosystem</h1>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </main>
  )
}
