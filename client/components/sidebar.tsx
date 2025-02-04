import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Inbox, Megaphone, Zap, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, text: "Dashboard", href: "/dashboard" },
  { icon: Inbox, text: "Unified Inbox", href: "/inbox" },
  { icon: Megaphone, text: "Marketing", href: "/dashboard/marketing" },
  { icon: Zap, text: "Automation", href: "/dashboard/automation" },
  { icon: BarChart3, text: "Analytics", href: "/dashboard/analytics" },
]

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-2xl font-bold">Yapahub</span>}
        <Button variant="ghost" size="icon" onClick={() => onCollapse(!collapsed)} className="ml-auto">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.text}>
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-primary-foreground hover:bg-primary-foreground/10",
                    collapsed ? "px-2" : "px-4",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-2">{item.text}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

