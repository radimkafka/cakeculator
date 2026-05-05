import { createFileRoute, redirect } from "@tanstack/react-router"
import { loadActiveRecipeId, loadRecipes } from "#/lib/recipe-book-storage"

export const Route = createFileRoute("/recipes/")({
  beforeLoad() {
    const recipes = loadRecipes()
    const activeId = loadActiveRecipeId()
    const targetId =
      activeId && recipes.some((r) => r.id === activeId)
        ? activeId
        : recipes[0].id
    throw redirect({
      to: "/recipes/$recipeId",
      params: { recipeId: targetId },
    })
  },
  component: () => null,
})
