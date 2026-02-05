"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  expense: {
    id: string
    name: string
    monthly_budget: number
  }
  onClose: () => void
  onSaved: () => void
}

export default function EditExpenseBudgetDialog({
  expense,
  onClose,
  onSaved,
}: Props) {
  const [value, setValue] = useState(String(expense.monthly_budget))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const amount = Number(value)
    if (!amount || amount <= 0) {
      setError("Budget must be greater than 0")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_budget: amount }),
      })

      if (!res.ok) {
        throw new Error("Failed to update budget")
      }

      onSaved()
    } catch (e) {
      setError("Failed to update budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit budget</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {expense.name}
          </p>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Monthly budget (DH)</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
