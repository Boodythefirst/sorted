// src/components/dashboard/side-nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  FolderOpen, 
  History, 
  Settings, 
  LogOut,
  Users,
  PieChart,
  PlayCircle,
  ClipboardList
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Sessions",
    icon: FolderOpen,
    href: "/dashboard/sessions",
    color: "text-violet-500",
  },
  {
    label: "Active",
    icon: PlayCircle,
    href: "/dashboard/active",
    color: "text-green-500",
  },
  {
    label: "Results",
    icon: PieChart,
    href: "/dashboard/results",
    color: "text-pink-500",
  },
  {
    label: "Templates",
    icon: ClipboardList,
    href: "/dashboard/templates",
    color: "text-yellow-500",
  },
  {
    label: "Participants",
    icon: Users,
    href: "/dashboard/participants",
    color: "text-orange-500",
  },
]

export function SideNav() {
  const pathname = usePathname()
  const signOut = useAuthStore((state) => state.signOut)
  const user = useAuthStore((state) => state.user)

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??'

  return (
    <div className="border-r bg-background/50 backdrop-blur-xl w-[200px] flex flex-col">
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 px-2",
                  pathname === route.href && "bg-secondary/50"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className={cn("h-4 w-4", route.color)} />
                  <span className="text-sm">{route.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs">
                <span className="font-medium truncate w-[120px]">{user?.name}</span>
                <span className="text-muted-foreground truncate w-[120px]">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}