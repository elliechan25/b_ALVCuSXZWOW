"use client"

import { Navigation } from "./navigation"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="ml-16 min-h-screen">
        {children}
      </main>
    </div>
  )
}
