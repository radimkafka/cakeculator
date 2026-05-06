import type { Ingredient } from "#/types/ingredient"
import { UNITS } from "#/lib/units"

export function calculateCost(
  unitPrice: number,
  amount: number,
  unit: Ingredient["unit"],
): number {
  const { conversionFactor } = UNITS[unit]
  return Math.round((unitPrice / conversionFactor) * amount * 100) / 100
}

export function calculateGrandTotal(ingredients: Ingredient[]): number {
  return Math.round(
    ingredients.reduce(
      (sum, ingredient) =>
        sum + calculateCost(ingredient.unitPrice, ingredient.amount, ingredient.unit),
      0,
    ) * 100,
  ) / 100
}
