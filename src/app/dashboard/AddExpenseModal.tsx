"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddExpenseModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const trimmed = name.trim()
    const value = Number(budget)

    if (!trimmed || !Number.isFinite(value) || value <= 0) {
      setError("Invalid values")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          monthly_budget: value,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.error ?? "Failed to add expense")
        return
      }

      onAdded()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
            <DialogDescription>
              Create a new budget category for this month.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="expense-name">Name</Label>
              <Input
                id="expense-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Home"
                disabled={loading}
              />
            </Field>

            <Field>
              <Label htmlFor="expense-budget">Monthly budget (DH)</Label>
              <Input
                id="expense-budget"
                type="number"
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: 5000"
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
