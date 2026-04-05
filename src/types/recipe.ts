import type { Ingredient } from "#/types/ingredient"

export type Recipe = {
  id: string
  name: string
  createdAt: number
  ingredients: Ingredient[]
}
