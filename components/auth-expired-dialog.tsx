"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { create } from "zustand"

// Mini store just for this dialog
interface AuthExpiredStore {
  isExpired: boolean
  trigger: () => void
  reset: () => void
}

export const useAuthExpired = create<AuthExpiredStore>((set) => ({
  isExpired: false,
  trigger: () => set({ isExpired: true }),
  reset: () => set({ isExpired: false }),
}))

export function AuthExpiredDialog() {
  const { isExpired } = useAuthExpired()
  const { logout } = useAuthStore()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <Dialog open={isExpired}>
<DialogContent
  className="sm:max-w-md"
  onInteractOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
  showCloseButton={false}
>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleLogout} className="w-full mt-2">
          <LogOut className="w-4 h-4 mr-2" />
          Log out and sign in again
        </Button>
      </DialogContent>
    </Dialog>
  )
}