import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"

export function CalendarDateRangePicker({ className }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-[260px] justify-start text-left font-normal",
          "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>20 Ene, 2026 - 09 Feb, 2026</span>
      </Button>
    </div>
  )
}
