import type { Ingredient } from "#/types/ingredient"

export function calculateCost(unitPrice: number, amount: number): number {
  return Math.round((unitPrice / 1000) * amount * 100) / 100
}

export function calculateGrandTotal(ingredients: Ingredient[]): number {
  return Math.round(
    ingredients.reduce(
      (sum, ingredient) =>
        sum + calculateCost(ingredient.unitPrice, ingredient.amount),
      0,
    ) * 100,
  ) / 100
}
