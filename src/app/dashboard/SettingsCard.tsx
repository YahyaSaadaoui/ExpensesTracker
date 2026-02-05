"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field"

type Settings = {
  salary: number
  monthStartDay: number
}

export default function SettingsCard({
  onUpdated,
}: {
  onUpdated?: () => void
}) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/settings")
      if (!res.ok) return
      setSettings(await res.json())
    })()
  }, [])

  async function save() {
    if (!settings) return

    setLoading(true)
    setError("")

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })

    setLoading(false)

    if (!res.ok) {
      setError("Failed to save settings")
      return
    }

    onUpdated?.()
  }

  if (!settings) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="salary">Monthly salary (DH)</Label>
          <Input
            id="salary"
            type="number"
            value={settings.salary}
            onChange={(e) =>
              setSettings({
                ...settings,
                salary: Number(e.target.value),
              })
            }
          />
        </Field>

        <Field>
          <Label htmlFor="monthStart">Month starts on day</Label>
          <Input
            id="monthStart"
            type="number"
            min={1}
            max={31}
            value={settings.monthStartDay}
            onChange={(e) =>
              setSettings({
                ...settings,
                monthStartDay: Number(e.target.value),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Example: 28 → month runs from 28 to 27
          </p>
        </Field>
      </FieldGroup>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading}>
          {loading ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  )
}
