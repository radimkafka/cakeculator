import type { Recipe } from "#/types/recipe-book"
import { generateId } from "#/lib/id"

const RECIPES_KEY = "cakeculator-recipe-book"
const ACTIVE_RECIPE_KEY = "cakeculator-active-recipe-book"

function createDefaultRecipe(): Recipe {
  return {
    id: generateId(),
    name: "Recipe 1",
    createdAt: Date.now(),
    diameter: 0,
    ingredients: [],
  }
}

export function loadRecipes(): Recipe[] {
  if (typeof window === "undefined") return [createDefaultRecipe()]

  try {
    const raw = window.localStorage.getItem(RECIPES_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Recipe[]
      }
      return [createDefaultRecipe()]
    }

    const defaultRecipes = [createDefaultRecipe()]
    saveRecipes(defaultRecipes)
    return defaultRecipes
  } catch {
    return [createDefaultRecipe()]
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes))
  } catch (err) {
    if (err instanceof Error && err.name === "QuotaExceededError") {
      console.warn("[cakeculator] localStorage quota exceeded — recipe book not saved")
    }
  }
}

export function loadActiveRecipeId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(ACTIVE_RECIPE_KEY)
  } catch {
    return null
  }
}

export function saveActiveRecipeId(id: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ACTIVE_RECIPE_KEY, id)
  } catch {
    // Ignore storage errors for active recipe tracking
  }
}
