"use client"

import { useState } from "react"
import { Settings2, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SettingsModal from "./SettingsModal"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export default function Navbar() {
  const [openSettings, setOpenSettings] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    try {
      setLoggingOut(true)
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-border/40 bg-background/70 backdrop-blur">
        {/* LEFT — LOGO ONLY */}
        <div className="flex items-center">
          <img
            src="/ExpensesTrackerLogo.png"
            alt="Expense Tracker"
            className="h-20 object-contain pt-6 pb-6"
          />
        </div>

        {/* RIGHT — ACTIONS */}
        <div className="flex items-center gap-1">
          {/* SETTINGS */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenSettings(true)}
            aria-label="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </Button>

          {/* LOGOUT (with confirmation) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmLogout(true)}
            aria-label="Logout"
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* SETTINGS MODAL */}
      {openSettings && (
        <SettingsModal onClose={() => setOpenSettings(false)} />
      )}

      {/* LOGOUT CONFIRMATION */}
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to enter the password again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={logout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out…
                </>
              ) : (
                "Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
