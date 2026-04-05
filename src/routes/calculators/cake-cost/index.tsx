import { createFileRoute, redirect } from "@tanstack/react-router"
import { loadActiveRecipeId, loadRecipes } from "#/lib/recipe-storage"

export const Route = createFileRoute("/calculators/cake-cost/")({
  beforeLoad() {
    const recipes = loadRecipes()
    const activeId = loadActiveRecipeId()
    const targetId =
      activeId && recipes.some((r) => r.id === activeId)
        ? activeId
        : recipes[0].id
    throw redirect({
      to: "/calculators/cake-cost/$recipeId",
      params: { recipeId: targetId },
    })
  },
  component: () => null,
})
