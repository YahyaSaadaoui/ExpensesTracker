"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SettingsCard from "./SettingsCard"

export default function SettingsModal({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-xs rounded-2xl p-5 shadow-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <SettingsCard onUpdated={onClose} />
      </DialogContent>
    </Dialog>
  )
}
