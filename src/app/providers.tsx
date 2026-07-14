'use client'

import StoreProvider from '@/store/StoreProvider'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'


export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <StoreProvider>
          {children}
        </StoreProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
