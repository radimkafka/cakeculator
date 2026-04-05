import { useEffect, useState } from "react"
import type { Ingredient } from "#/types/ingredient"

const STORAGE_KEY = "cakeculator-ingredients"

function loadIngredients(): Ingredient[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as Ingredient[]
  } catch {
    return []
  }
}

export default function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(loadIngredients)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients))
  }, [ingredients])

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        unitPrice: 0,
        amount: 0,
      },
    ])
  }

  function updateIngredient(
    id: string,
    patch: Partial<Omit<Ingredient, "id">>,
  ) {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((item) => item.id !== id))
  }

  return { ingredients, addIngredient, updateIngredient, removeIngredient }
}
