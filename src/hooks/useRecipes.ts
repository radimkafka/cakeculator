import { useEffect, useState } from "react"
import type { Recipe } from "#/types/recipe"
import type { Ingredient } from "#/types/ingredient"
import { generateId } from "#/lib/id"
import {
  loadRecipes,
  saveRecipes,
  loadActiveRecipeId,
  saveActiveRecipeId,
} from "#/lib/recipe-storage"

export default function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes)
  const [activeRecipeId, setActiveRecipeIdState] = useState<string>(() => {
    const saved = loadActiveRecipeId()
    const loaded = loadRecipes()
    if (saved && loaded.some((r) => r.id === saved)) return saved
    return loaded[0]?.id ?? ""
  })

  useEffect(() => {
    saveRecipes(recipes)
  }, [recipes])

  useEffect(() => {
    if (activeRecipeId) saveActiveRecipeId(activeRecipeId)
  }, [activeRecipeId])

  const activeRecipe = recipes.find((r) => r.id === activeRecipeId) ?? recipes[0]
  const ingredients = activeRecipe?.ingredients ?? []

  function createRecipe(): string {
    const newRecipe: Recipe = {
      id: generateId(),
      name: `Recipe ${recipes.length + 1}`,
      createdAt: Date.now(),
      ingredients: [],
    }
    setRecipes((prev) => [...prev, newRecipe])
    setActiveRecipeIdState(newRecipe.id)
    return newRecipe.id
  }

  function renameRecipe(id: string, name: string) {
    const safeName = name.trim() || "Untitled Recipe"
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: safeName } : r)),
    )
  }

  function copyRecipe(id: string): string | null {
    const source = recipes.find((r) => r.id === id)
    if (!source) return null
    const copy: Recipe = {
      id: generateId(),
      name: `${source.name} (Copy)`,
      createdAt: Date.now(),
      ingredients: source.ingredients.map((ing) => ({ ...ing, id: crypto.randomUUID() })),
    }
    setRecipes((prev) => [...prev, copy])
    setActiveRecipeIdState(copy.id)
    return copy.id
  }

  function deleteRecipe(id: string): string | null {
    if (recipes.length <= 1) return null
    const remaining = recipes.filter((r) => r.id !== id)
    setRecipes(remaining)
    if (activeRecipeId === id) {
      const next = remaining[0]
      setActiveRecipeIdState(next.id)
      return next.id
    }
    return null
  }

  function setActiveRecipe(id: string) {
    if (!recipes.some((r) => r.id === id)) return
    setActiveRecipeIdState(id)
  }

  function addIngredient() {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === activeRecipeId
          ? {
              ...r,
              ingredients: [
                ...r.ingredients,
                { id: crypto.randomUUID(), name: "", unitPrice: 0, amount: 0 },
              ],
            }
          : r,
      ),
    )
  }

  function updateIngredient(id: string, patch: Partial<Omit<Ingredient, "id">>) {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === activeRecipeId
          ? {
              ...r,
              ingredients: r.ingredients.map((ing) =>
                ing.id === id ? { ...ing, ...patch } : ing,
              ),
            }
          : r,
      ),
    )
  }

  function removeIngredient(id: string) {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === activeRecipeId
          ? { ...r, ingredients: r.ingredients.filter((ing) => ing.id !== id) }
          : r,
      ),
    )
  }

  return {
    recipes,
    activeRecipe,
    activeRecipeId,
    ingredients,
    createRecipe,
    renameRecipe,
    copyRecipe,
    deleteRecipe,
    setActiveRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
  }
}
