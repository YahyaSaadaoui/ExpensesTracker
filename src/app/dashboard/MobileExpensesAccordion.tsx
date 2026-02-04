"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  expenses: any[]
  onAdd: (e: any) => void
  onView: (e: any) => void
  onDelete: (id: string) => void
  onUpdateBudget: (id: string, value: number) => void
}

export default function MobileExpensesAccordion({
  expenses,
  onAdd,
  onView,
  onDelete,
  onUpdateBudget,
}: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {expenses.map(e => (
        <AccordionItem key={e.id} value={e.id}>
          <AccordionTrigger>
            <div className="flex justify-between w-full">
              <span>{e.name}</span>
              <span className="text-sm text-muted-foreground">
                {e.consumed} DH
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Budget
              </label>
              <Input
                type="number"
                defaultValue={e.monthly_budget}
                onBlur={(ev) =>
                  onUpdateBudget(e.id, Number(ev.target.value))
                }
              />
            </div>

            <div className="text-sm">
              Consumed: <b>{e.consumed} DH</b>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAdd(e)}>
                Add
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onView(e)}>
                View
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(e.id)}
              >
                Delete
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
