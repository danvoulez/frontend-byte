"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarSeparator,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"
import { canAccessRoute, type Role } from "@/lib/rbac"
import {
  Shield, LayoutDashboard, FileText, Search, ShieldCheck, Plug, ClipboardList,
  CreditCard, Settings, Users, HelpCircle, ChevronDown, LogOut, Lock,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Visao Geral", href: "/console", icon: LayoutDashboard },
  { label: "Execucoes", href: "/console/executions", icon: FileText },
  { label: "Evidencias", href: "/console/evidence", icon: Search },
  { label: "Politicas", href: "/console/policies", icon: ShieldCheck },
  { label: "Integracoes", href: "/console/integrations", icon: Plug },
  { label: "Auditorias", href: "/console/audits", icon: ClipboardList },
  { label: "Faturamento", href: "/console/billing", icon: CreditCard },
  { label: "Equipe & RBAC", href: "/console/team", icon: Users },
  { label: "Configuracoes", href: "/console/settings", icon: Settings },
]

const deniedTooltips: Record<string, string> = {
  "/console/billing": "Acesso restrito ao Owner",
  "/console/team": "Requer Admin ou superior",
  "/console/settings": "Requer Admin ou superior",
  "/console/policies": "Requer Admin ou superior para editar",
  "/console/integrations": "Requer Admin ou superior",
  "/console/audits": "Requer Auditor ou superior",
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const role: Role = user?.role ?? "Auditor"

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/console" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-sidebar-primary">TDLN</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="mt-3 flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              <span className="truncate">Empresa Corp</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>Empresa Corp</DropdownMenuItem>
              <DropdownMenuItem>Projeto Sandbox</DropdownMenuItem>
              <DropdownMenuItem>+ Novo tenant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const allowed = canAccessRoute(role, item.href)
                  if (!allowed) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/30 cursor-not-allowed select-none">
                              <item.icon className="h-4 w-4" />
                              <span className="flex-1">{item.label}</span>
                              <Lock className="h-3 w-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {deniedTooltips[item.href] ?? "Sem permissao"}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    )
                  }
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ajuda">
                <Link href="/console/help">
                  <HelpCircle />
                  <span>Ajuda & Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Sair">
                  <LogOut />
                  <span className="flex flex-col items-start">
                    <span className="text-xs font-medium">{user.name}</span>
                    <span className="text-[10px] text-sidebar-foreground/60">{user.email}</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
