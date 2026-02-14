"use client"

import React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/console/app-sidebar"
import { TopBar } from "@/components/console/top-bar"
import { useAuth } from "@/lib/auth-context"

function ConsoleShellSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
        <div className="p-4 space-y-3">
          <div className="h-8 w-32 animate-pulse rounded-md bg-sidebar-accent" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-md bg-sidebar-accent" />
            ))}
          </div>
        </div>
      </div>
      {/* Main skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="h-14 border-b bg-background" />
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsoleLayout({
  children,
}: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  // Show skeleton while auth is loading
  if (isLoading) return <ConsoleShellSkeleton />

  // If no user, auth-context will redirect to /login -- render nothing to avoid flash
  if (!user) return <ConsoleShellSkeleton />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
