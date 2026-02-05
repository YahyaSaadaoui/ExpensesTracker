"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Consumption = {
  id: string
  amount: number
  note?: string
}

export default function ViewConsumptionsModal({
  expense,
  onClose,
  onChanged,
}: {
  expense: { id: string; name: string }
  onClose: () => void
  onChanged: () => void
}) {
  const [rows, setRows] = useState<Consumption[]>([])
  const [deleteConsumptionId, setDeleteConsumptionId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    const res = await fetch(`/api/consumptions?expense_id=${expense.id}`)
    const json = await res.json()
    setRows(json.consumptions ?? [])
  }

  useEffect(() => {
    load()
  }, [expense.id])

  async function updateConsumption(id: string, patch: Partial<Consumption>) {
    await fetch(`/api/consumptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })

    await load()
    onChanged()
  }

  async function confirmDeleteConsumption() {
    if (!deleteConsumptionId) return

    try {
      setDeleting(true)
      await fetch(`/api/consumptions/${deleteConsumptionId}`, {
        method: "DELETE",
      })
      setDeleteConsumptionId(null)
      await load()
      onChanged()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {expense.name} — Consumptions
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {rows.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-xl bg-muted/40 p-3"
              >
                <Input
                  type="number"
                  defaultValue={c.amount}
                  className="w-24"
                  onBlur={(e) =>
                    updateConsumption(c.id, {
                      amount: Number(e.target.value),
                    })
                  }
                />

                <Input
                  defaultValue={c.note ?? ""}
                  className="flex-1"
                  placeholder="Note"
                  onBlur={(e) =>
                    updateConsumption(c.id, { note: e.target.value })
                  }
                />

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteConsumptionId(c.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONSUMPTION CONFIRMATION */}
      <AlertDialog
        open={!!deleteConsumptionId}
        onOpenChange={() => setDeleteConsumptionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this consumption?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.  
              The selected consumption entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConsumption}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
