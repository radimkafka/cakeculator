import { describe, it, expect } from "vitest"
import { calculateCost, calculateGrandTotal } from "./calculator"
import type { Ingredient } from "#/types/ingredient"

describe("calculateCost", () => {
  it("converts grams against price-per-kg", () => {
    expect(calculateCost(200, 100, "g")).toBe(20)
  })

  it("converts millilitres against price-per-litre", () => {
    expect(calculateCost(30, 50, "ml")).toBe(1.5)
  })

  it("treats tbsp 1:1", () => {
    expect(calculateCost(2, 3, "tbsp")).toBe(6)
  })

  it("treats tsp 1:1", () => {
    expect(calculateCost(0.5, 4, "tsp")).toBe(2)
  })

  it("treats pcs 1:1", () => {
    expect(calculateCost(5, 2, "pcs")).toBe(10)
  })

  it("rounds to two decimals", () => {
    expect(calculateCost(199, 33, "g")).toBe(6.57)
  })
})

describe("calculateGrandTotal", () => {
  it("sums mixed-unit ingredients", () => {
    const ingredients: Ingredient[] = [
      { id: "1", name: "flour", unitPrice: 20, amount: 500, unit: "g" },
      { id: "2", name: "milk", unitPrice: 30, amount: 250, unit: "ml" },
      { id: "3", name: "egg", unitPrice: 5, amount: 3, unit: "pcs" },
    ]
    expect(calculateGrandTotal(ingredients)).toBe(10 + 7.5 + 15)
  })
})
