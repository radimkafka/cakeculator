import type { Ingredient } from "#/types/ingredient"

export type Order = {
  id: string
  name: string
  createdAt: number
  ingredients: Ingredient[]
}
