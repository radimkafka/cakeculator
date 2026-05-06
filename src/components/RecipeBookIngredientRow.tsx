import { X } from "lucide-react"
import type { Ingredient } from "#/types/recipe-book"
import UnitSelector from "#/components/UnitSelector"

type RecipeBookIngredientRowProps = {
  ingredient: Ingredient
  onChange: (id: string, patch: Partial<Omit<Ingredient, "id">>) => void
  onRemove: (id: string) => void
}

const inputClasses =
  "bg-background border-2 border-border rounded-md px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--border)] transition-shadow"

export default function RecipeBookIngredientRow({
  ingredient,
  onChange,
  onRemove,
}: RecipeBookIngredientRowProps) {
  return (
    <div className="bg-card border-2 border-border rounded-md p-4 shadow-[4px_4px_0px_0px_var(--border)] flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_auto] md:items-end md:gap-3">
      {/* Name + Delete */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
            Name
          </label>
          <input
            type="text"
            value={ingredient.name}
            onChange={(e) =>
              onChange(ingredient.id, { name: e.target.value })
            }
            placeholder="Ingredient name"
            maxLength={60}
            className={`${inputClasses} w-full`}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(ingredient.id)}
          className="shrink-0 border-2 border-border rounded-md p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors md:order-last"
          aria-label="Remove ingredient"
        >
          <X size={14} />
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
          Amount
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={ingredient.amount || ""}
            onChange={(e) =>
              onChange(ingredient.id, {
                amount: Number.parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
            min="0"
            step="1"
            className={`${inputClasses} w-24`}
          />
          <UnitSelector
            value={ingredient.unit}
            onChange={(unit) => onChange(ingredient.id, { unit })}
            ariaLabel="Select amount unit"
          />
        </div>
      </div>
    </div>
  )
}
