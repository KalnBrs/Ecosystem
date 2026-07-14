'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import Image from 'next/image'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Image src = {theme == 'dark' ? 'brightness.svg' : 'moon.svg'} alt="" width={20} height={20} className="block light:hidden change-icon-color" />
    </button>
  )
}
