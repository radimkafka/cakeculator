import type { Recipe } from "#/types/recipe"
import type { Ingredient } from "#/types/ingredient"
import { generateId } from "#/lib/id"

const RECIPES_KEY = "cakeculator-recipes"
const LEGACY_KEY = "cakeculator-ingredients"
const ACTIVE_RECIPE_KEY = "cakeculator-active-recipe"

function createDefaultRecipe(): Recipe {
  return {
    id: generateId(),
    name: "Recipe 1",
    createdAt: Date.now(),
    ingredients: [],
  }
}

export function loadRecipes(): Recipe[] {
  if (typeof window === "undefined") return [createDefaultRecipe()]

  try {
    // Path A: already migrated — new key exists
    const raw = window.localStorage.getItem(RECIPES_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Recipe[]
      }
      // Malformed data in new key — return default
      return [createDefaultRecipe()]
    }

    // Path B: legacy data exists — migrate
    const migrated = migrateFromLegacy()
    if (migrated) return migrated

    // Path C: first visit — no data at all
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
      console.warn("[cakeculator] localStorage quota exceeded — recipes not saved")
    }
  }
}

export function migrateFromLegacy(): Recipe[] | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(LEGACY_KEY)
    if (!raw) return null

    const ingredients: unknown = JSON.parse(raw)
    if (!Array.isArray(ingredients)) return null

    const recipe: Recipe = {
      id: generateId(),
      name: "Recipe 1",
      createdAt: Date.now(),
      ingredients: ingredients as Ingredient[],
    }
    const recipes = [recipe]

    // Write new format
    window.localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes))

    // Verify write succeeded before deleting old key
    const verified = window.localStorage.getItem(RECIPES_KEY)
    if (!verified) {
      console.warn("[cakeculator] migration verification failed — keeping legacy key")
      return null
    }

    // Safe to delete legacy key now
    window.localStorage.removeItem(LEGACY_KEY)
    return recipes
  } catch {
    return null
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
