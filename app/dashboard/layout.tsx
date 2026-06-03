import { AppSidebar } from "@/components/app-sidebar"
import { AuthExpiredDialog } from "@/components/auth-expired-dialog"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>

      <AuthExpiredDialog />
    </SidebarProvider>
  )
}