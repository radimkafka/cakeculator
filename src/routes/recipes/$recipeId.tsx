import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { BookOpen, Cloud, Loader2, Plus, RefreshCw, ShoppingBasket } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "#/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import RecipeBookIngredientRow from "#/components/RecipeBookIngredientRow"
import RecipeBookSwitcher from "#/components/RecipeBookSwitcher"
import { useAuth } from "#/contexts/AuthContext"
import { useGDriveSync } from "#/contexts/GDriveSyncContext"
import useOrders from "#/hooks/useOrders"
import useRecipeBook from "#/hooks/useRecipeBook"
import { panScalingCoefficient } from "#/lib/pan-scaling"
import type { Ingredient } from "#/types/ingredient"

export const Route = createFileRoute("/recipes/$recipeId")({
  component: RecipePage,
})

const inputClasses =
  "bg-background border-2 border-border rounded-md px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--border)] transition-shadow"

const badgeClasses =
  "text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-border rounded px-2 py-1 shadow-[2px_2px_0px_0px_var(--border)] select-none shrink-0"

function RecipePage() {
  const { recipeId } = Route.useParams()
  const navigate = useNavigate()
  const { state: authState } = useAuth()
  const { syncStatus, error: syncError, pendingCloudData, saveAllToDrive, refetchFromDrive, acceptCloudData, dismissCloudData } = useGDriveSync()
  const {
    recipes,
    setActiveRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    updateRecipe,
    createRecipe,
    renameRecipe,
    copyRecipe,
    deleteRecipe,
    replaceRecipes,
  } = useRecipeBook()
  const { createOrder } = useOrders()

  const activeRecipe = recipes.find((r) => r.id === recipeId) ?? recipes[0]
  const ingredients = activeRecipe?.ingredients ?? []

  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [targetDiameter, setTargetDiameter] = useState(0)

  function openCreateOrderDialog() {
    if (!activeRecipe) return
    setTargetDiameter(activeRecipe.diameter)
    setOrderDialogOpen(true)
  }

  function handleCreateOrderFromRecipe() {
    if (!activeRecipe) return
    const coef = panScalingCoefficient(targetDiameter, activeRecipe.diameter)
    if (coef === 0) return
    const orderIngredients: Ingredient[] = activeRecipe.ingredients.map((ing) => ({
      id: crypto.randomUUID(),
      name: ing.name,
      unitPrice: 0,
      amount: Math.round(ing.amount * coef * 100) / 100,
      unit: ing.unit,
    }))
    const newOrderId = createOrder(activeRecipe.name, orderIngredients)
    setOrderDialogOpen(false)
    navigate({
      to: "/calculators/cake-cost/$orderId",
      params: { orderId: newOrderId },
    })
  }

  useEffect(() => {
    if (!recipes.length) return
    const exists = recipes.some((r) => r.id === recipeId)
    if (!exists) {
      navigate({
        to: "/recipes/$recipeId",
        params: { recipeId: recipes[0].id },
        replace: true,
      })
      return
    }
    setActiveRecipe(recipeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  function handleSelectRecipe(id: string) {
    navigate({ to: "/recipes/$recipeId", params: { recipeId: id } })
  }

  function handleCreateRecipe() {
    const newId = createRecipe()
    navigate({ to: "/recipes/$recipeId", params: { recipeId: newId } })
  }

  function handleCopyRecipe(id: string) {
    const newId = copyRecipe(id)
    if (newId) {
      navigate({ to: "/recipes/$recipeId", params: { recipeId: newId } })
    }
  }

  function handleDeleteRecipe(id: string) {
    const nextId = deleteRecipe(id)
    if (nextId) {
      navigate({ to: "/recipes/$recipeId", params: { recipeId: nextId } })
    }
  }

  function handleAcceptCloud() {
    const data = acceptCloudData()
    const cloudRecipes = data.recipeBook.recipes
    if (cloudRecipes.length > 0) {
      replaceRecipes(cloudRecipes)
      navigate({ to: "/recipes/$recipeId", params: { recipeId: cloudRecipes[0].id } })
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      {pendingCloudData && (
        <div className="bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-secondary-foreground shrink-0" />
            <span className="text-sm font-medium text-secondary-foreground">
              Newer data found in your Google Drive
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleAcceptCloud}>
              Use Cloud
            </Button>
            <Button variant="outline" size="sm" onClick={dismissCloudData}>
              Keep Local
            </Button>
          </div>
        </div>
      )}

      <RecipeBookSwitcher
        recipes={recipes}
        activeRecipe={activeRecipe}
        onSelectRecipe={handleSelectRecipe}
        onCreateRecipe={handleCreateRecipe}
        onRenameRecipe={renameRecipe}
        onCopyRecipe={handleCopyRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />

      {activeRecipe && (
        <div className="bg-card border-2 border-border rounded-md p-4 shadow-[4px_4px_0px_0px_var(--border)] mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
              Diameter
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={activeRecipe.diameter || ""}
                onChange={(e) =>
                  updateRecipe(activeRecipe.id, {
                    diameter: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min="0"
                step="1"
                className={`${inputClasses} w-24`}
              />
              <span className={badgeClasses}>CM</span>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={openCreateOrderDialog}
            disabled={
              activeRecipe.ingredients.length === 0 ||
              activeRecipe.diameter <= 0
            }
            className="ml-auto"
          >
            <ShoppingBasket className="h-4 w-4 mr-1.5" />
            Create order from recipe
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {ingredients.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-md p-8 shadow-[4px_4px_0px_0px_var(--border)] text-center">
            <BookOpen
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
            <RecipeBookIngredientRow
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

        {authState.status === "authenticated" && (
          <div className="flex items-center gap-3 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveAllToDrive()}
              disabled={syncStatus === "saving" || syncStatus === "fetching"}
            >
              {syncStatus === "saving" ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4 mr-1.5" />
              )}
              {syncStatus === "saving" ? "Saving..." : "Save to Drive"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchFromDrive()}
              disabled={syncStatus === "saving" || syncStatus === "fetching"}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5${syncStatus === "fetching" ? " animate-spin" : ""}`}
              />
              {syncStatus === "fetching" ? "Refreshing..." : "Refetch"}
            </Button>
            {syncStatus === "saved" && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            {syncStatus === "error" && syncError && (
              <span className="text-xs text-destructive">{syncError}</span>
            )}
          </div>
        )}
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create order from recipe</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
              Target diameter
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={targetDiameter || ""}
                onChange={(e) =>
                  setTargetDiameter(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                min="0"
                step="1"
                autoFocus
                className={`${inputClasses} w-24`}
              />
              <span className={badgeClasses}>CM</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreateOrderFromRecipe}
              disabled={targetDiameter <= 0}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
