import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { UNITS, UNIT_IDS, type UnitId } from "#/lib/units"

type UnitSelectorProps = {
  value: UnitId
  onChange: (unit: UnitId) => void
  ariaLabel?: string
}

export default function UnitSelector({
  value,
  onChange,
  ariaLabel = "Select unit",
}: UnitSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex items-center gap-1 text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-border rounded px-2 py-1 shadow-[2px_2px_0px_0px_var(--border)] select-none shrink-0 cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          <span>{UNITS[value].label}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] min-w-[8rem]"
      >
        {UNIT_IDS.map((id) => (
          <DropdownMenuItem key={id} onSelect={() => onChange(id)}>
            {id === value ? (
              <Check className="h-4 w-4 text-foreground" />
            ) : (
              <span className="w-4" />
            )}
            <span className={id === value ? "font-bold" : ""}>
              {UNITS[id].label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
