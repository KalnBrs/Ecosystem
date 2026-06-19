"use client"
import { usePathname } from "next/navigation"
import "./Sidebar.css"

import Image from "next/image"
import Link from "next/link"

const tabs = [
  { href: "/inbox",        label: "Inbox" },
  { href: "/morning3",     label: "Morning 3" },
  { href: "/tasks",        label: "Tasks" },
  { href: "/calendar",     label: "Calendar" },
  { href: "/daily-reset",  label: "Daily Reset" },
  { href: "/projects",     label: "Projects" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar fixed left-0 top-0 w-55 h-screen border-r-2">
      <div className="mx-3">
        <div className="flex items-center h-20">
          <h1 className="title font-bold">Ecosystem</h1>
        </div>
        <section className="flex flex-col justify-between border-b-2 h-150">
          <div className="flex flex-col space-y-0.5 flex-1">
            {tabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`tab ${pathname === href ? "selected" : ""} flex flex-row`}
              >
                <Image src={"file.svg"} alt="" width={20} height={20} /> {label}
              </Link>
            ))}
          </div>
          <div className="">
            <button className="flex flex-row"><Image src={"file.svg"} alt="" width={20} height={20} /> Quick Jump <span className="">Col K</span> </button>
          </div>
        </section>
        <div className="flex flex-row items-center">
          <Image src={"file.svg"} alt="" width={30} height={30} />
          <p>Kaelan Brose</p>
          <Image src ={"file.svg"} alt="" width={20} height={20} />
          <Image src ={"file.svg"} alt="" width={20} height={20} />
        </div>
      </div>
    </div>
  )
}