"use client"
import { usePathname } from "next/navigation"
import styles from "./Sidebar.module.css"

import Image from "next/image"
import Link from "next/link"
import ThemeToggle from "./ThemeToggle"
import { useSession } from "next-auth/react"

const tabs = [
  { href: "/inbox",        label: "Inbox",        icon: "/inbox-full.svg" },
  { href: "/morning3",     label: "Morning 3",    icon: "/brightness.svg" },
  { href: "/tasks",        label: "Tasks",        icon: "/list-check.svg" },
  { href: "/calendar",     label: "Calendar",     icon: "/calendar-minus.svg"},
  { href: "/daily-reset",  label: "Daily Reset",  icon: "/sparkles.svg"},
  { href: "/projects",     label: "Projects",     icon: "/folder.svg"},
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className={`${styles.sidebar} w-auto min-h-screen border-r-2 shrink-0`}>
      <div className="mx-3 flex flex-col h-full">
        <div className="flex items-center h-20">
          <h1 className={`${styles.title} font-bold`}>Ecosystem</h1>
        </div>
        <div className="flex flex-col flex-1 justify-between pb-3">
          <div className="flex flex-col space-y-0.5">
            {tabs.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.tab} ${pathname === href ? styles.selected : ""} flex flex-row my-0.5`}
              >
                <Image src={icon} alt="" width={20} height={20} className={styles.changeIconColor} /> {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className={`text-black ${styles.changeIconColor} mx-3`}>
              <button className="flex flex-row  justify-between items-center w-full gap-3">
                <Image src={"/command.svg"} alt="" width={15} height={15} /> 
                <p>Quick Jump</p>
                <span className="flex flex-row items-center gap-1">              
                  <Image src={"/command.svg"} alt="" width={8} height={8} className="" /> K
                </span> 
              </button>
            </div>

            <div className="flex flex-row justify-between items-center w-full gap-2 border-t-2 pt-3 pb-3 px-2">
              <div className="rounded-full bg-zinc-200 dark:bg-zinc-700 p-0.5 shadow-sm">
                <Image src={session?.user.image ?? "/default-avatar.svg"} alt="Profile picture" width={30} height={30} className="rounded-full object-cover" />
              </div>
              <p className="text-sm w-25 text-left">{session?.user.name ? session?.user.name : "name"}</p>
              <ThemeToggle />
              <Image src={"/settings.svg"} alt="" width={20} height={20} className={styles.changeIconColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}