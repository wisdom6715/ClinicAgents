"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  BarChart3,
  Settings,
  Layers,
  Box,
  LogOut
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

// Define types for route mapping
type RouteKey = "home" | "chart" | "deployment" | "templates" | "settings" | "logout"

// Define interface for NavItem props
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  id: string;
  active: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

export default function SideNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<RouteKey>("home")

  // Set up routes mapping
  const routeMap: Record<RouteKey, string> = {
    home: "/dashboard",
    chart: "/chart",
    deployment: "/deployment",
    templates: "/templates",
    settings: "/settings",
    logout: "/logout" // You'll want to handle this differently
  }

  // Update active tab based on pathname
  useEffect(() => {
    // Extract the active tab from pathname
    const path = pathname === "/" ? "/dashboard" : pathname
    
    // Find the route key that corresponds to the current path
    const currentTab = Object.entries(routeMap).find(
      ([_, value]) => value === path
    )?.[0] as RouteKey | undefined
    
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [pathname, routeMap])

  // Handle tab change and navigation
  const handleTabChange = (currentTab: RouteKey) => {
    setActiveTab(currentTab)
    
    // Handle logout separately if needed
    if (currentTab === "logout") {
      console.log("Logging out...")
      // Then redirect to login page or home
      router.push("/login")
      return
    }
    
    // Navigate to the corresponding route
    router.push(routeMap[currentTab])
  }

  // Check viewport size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768) // Collapse on tablet and below
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className={cn(
      "border-r bg-slate-900 text-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex items-center p-4",
        isCollapsed ? "justify-center" : "gap-2"
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400">
          <span className="text-sm font-bold">AI</span>
        </div>
        {!isCollapsed && <span className="text-lg font-semibold">ClinicAgent</span>}
      </div>

      <Separator className="my-2 bg-slate-700" />

      <div className="space-y-1 p-2">
        <NavItem
          icon={Home}
          label="Home"
          id="home"
          active={activeTab === "home"}
          onClick={() => handleTabChange("home")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={BarChart3}
          label="Chart"
          id="chart"
          active={activeTab === "chart"}
          onClick={() => handleTabChange("chart")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={Layers}
          label="Deployment"
          id="deployment"
          active={activeTab === "deployment"}
          onClick={() => handleTabChange("deployment")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={Box}
          label="Templates"
          id="templates"
          active={activeTab === "templates"}
          onClick={() => handleTabChange("templates")}
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="absolute bottom-6 left-0 p-2">
        <NavItem
          icon={Settings}
          label="Settings"
          id="settings"
          active={activeTab === "settings"}
          onClick={() => handleTabChange("settings")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={LogOut}
          label="Logout"
          id="logout"
          active={activeTab === "logout"}
          onClick={() => handleTabChange("logout")}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, id, active, onClick, isCollapsed }: NavItemProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
        active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
        isCollapsed ? "justify-center" : ""
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span>{label}</span>}
    </button>
  )
}