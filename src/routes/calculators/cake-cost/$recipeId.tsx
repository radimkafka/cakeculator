import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Plus, ShoppingBasket } from "lucide-react"
import { useEffect } from "react"
import { Button } from "#/components/ui/button"
import IngredientRow from "#/components/IngredientRow"
import RecipeSwitcher from "#/components/RecipeSwitcher"
import useRecipes from "#/hooks/useRecipes"
import { calculateGrandTotal } from "#/lib/calculator"

export const Route = createFileRoute("/calculators/cake-cost/$recipeId")({
  component: RecipePage,
})

function RecipePage() {
  const { recipeId } = Route.useParams()
  const navigate = useNavigate()
  const {
    recipes,
    setActiveRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    createRecipe,
    renameRecipe,
    copyRecipe,
    deleteRecipe,
  } = useRecipes()

  // URL is the source of truth for which recipe is displayed
  const activeRecipe = recipes.find((r) => r.id === recipeId) ?? recipes[0]
  const ingredients = activeRecipe?.ingredients ?? []

  // Sync hook's activeRecipeId so ingredient ops target the right recipe
  // Also handle invalid recipe IDs in the URL
  useEffect(() => {
    if (!recipes.length) return
    const exists = recipes.some((r) => r.id === recipeId)
    if (!exists) {
      navigate({
        to: "/calculators/cake-cost/$recipeId",
        params: { recipeId: recipes[0].id },
        replace: true,
      })
      return
    }
    setActiveRecipe(recipeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]) // intentionally only recipeId — avoids feedback loop

  // Navigation handlers — all navigation lives here, not in the hook
  function handleSelectRecipe(id: string) {
    navigate({ to: "/calculators/cake-cost/$recipeId", params: { recipeId: id } })
  }

  function handleCreateRecipe() {
    const newId = createRecipe()
    navigate({ to: "/calculators/cake-cost/$recipeId", params: { recipeId: newId } })
  }

  function handleCopyRecipe(id: string) {
    const newId = copyRecipe(id)
    if (newId) {
      navigate({ to: "/calculators/cake-cost/$recipeId", params: { recipeId: newId } })
    }
  }

  function handleDeleteRecipe(id: string) {
    const nextId = deleteRecipe(id)
    if (nextId) {
      navigate({ to: "/calculators/cake-cost/$recipeId", params: { recipeId: nextId } })
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <RecipeSwitcher
        recipes={recipes}
        activeRecipe={activeRecipe}
        onSelectRecipe={handleSelectRecipe}
        onCreateRecipe={handleCreateRecipe}
        onRenameRecipe={renameRecipe}
        onCopyRecipe={handleCopyRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />

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
