"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Home, LogOut, Sun, Moon, Monitor } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const themes = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
    { label: "System", value: "system", icon: Monitor },
  ]

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <span className="text-lg font-bold tracking-tight">FileFind</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="text-base py-5">
                    <Link href="/dashboard">
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>

            {/* Theme toggle */}
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton className="text-base py-5">
                    {resolvedTheme === "dark" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                    <span>Theme</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="end" className="w-40 p-1">
                  {themes.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent
                        ${resolvedTheme === value || (value === "system" && !["light", "dark"].includes(resolvedTheme ?? ""))
                          ? "bg-accent font-medium"
                          : ""
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>

            {/* Logout */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setLogoutOpen(true)}
                className="text-base py-5 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setLogoutOpen(false)}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}