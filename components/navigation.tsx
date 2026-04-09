"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, FolderKanban, Layout, Plug, BarChart3, Settings, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/workspace", label: "Workspace", icon: Layout },
  { href: "/integrations", label: "Sync Hub", icon: Plug },
  { href: "/analytics", label: "Pulse", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Default to dark mode
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <nav className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-border bg-sidebar py-4">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
        PM
      </div>
      
      <div className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="absolute left-14 z-50 hidden whitespace-nowrap rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground shadow-md group-hover:block">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </nav>
  )
}
