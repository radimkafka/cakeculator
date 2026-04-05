import { createFileRoute } from "@tanstack/react-router"
import { Plus, ShoppingBasket } from "lucide-react"
import { Button } from "#/components/ui/button"
import IngredientRow from "#/components/IngredientRow"
import useIngredients from "#/hooks/useIngredients"
import { calculateGrandTotal } from "#/lib/calculator"

export const Route = createFileRoute("/calculators/cake-cost")({
  component: CalculatorPage,
})

function CalculatorPage() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } =
    useIngredients()

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Ingredient Calculator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculate ingredient costs for your recipes
        </p>
      </div>

      {/* Ingredient list */}
      <div className="flex flex-col gap-3">
        {ingredients.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-md p-8 shadow-[4px_4px_0px_0px_var(--border)] text-center">
            <ShoppingBasket
              size={32}
              className="mx-auto mb-3 text-muted-foreground"
            />
            <p className="font-bold text-foreground">No ingredients yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first ingredient to get started
            </p>
          </div>
        ) : (
          ingredients.map((ingredient) => (
            <IngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              onChange={updateIngredient}
              onRemove={removeIngredient}
            />
          ))
        )}

        <Button
          variant="default"
          size="sm"
          onClick={addIngredient}
          className="self-start"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Ingredient
        </Button>

        {ingredients.length > 0 && (
          <div className="bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] flex justify-between items-center">
            <span className="font-bold text-sm uppercase tracking-wide text-secondary-foreground">
              Total Cost
            </span>
            <span className="font-bold text-lg tabular-nums text-secondary-foreground">
              {calculateGrandTotal(ingredients).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
   )
 }
