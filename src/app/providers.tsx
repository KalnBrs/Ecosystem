'use client'

import StoreProvider from '@/store/StoreProvider'
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>
        {children}
      </StoreProvider>
    </ThemeProvider>
  )
}
