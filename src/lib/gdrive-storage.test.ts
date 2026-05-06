import { describe, it, expect } from "vitest"
import { CloudDataSchema } from "./gdrive-storage"

const validCloudData = {
  schemaVersion: 1,
  cakeCost: { orders: [] },
  recipeBook: { recipes: [] },
}

describe("CloudDataSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(CloudDataSchema.safeParse(validCloudData).success).toBe(true)
  })

  it("rejects a missing schemaVersion", () => {
    const { schemaVersion: _omit, ...rest } = validCloudData
    expect(CloudDataSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects a wrong schemaVersion", () => {
    expect(
      CloudDataSchema.safeParse({ ...validCloudData, schemaVersion: 99 }).success,
    ).toBe(false)
  })

  it("rejects malformed nested data", () => {
    const bad = {
      ...validCloudData,
      recipeBook: { recipes: [{ id: "r" }] },
    }
    expect(CloudDataSchema.safeParse(bad).success).toBe(false)
  })

  it("accepts well-formed nested data", () => {
    const good = {
      schemaVersion: 1,
      cakeCost: {
        orders: [
          {
            id: "o1",
            name: "Order",
            createdAt: 1,
            ingredients: [{ id: "i", name: "n", unitPrice: 1, amount: 2 }],
          },
        ],
      },
      recipeBook: {
        recipes: [
          {
            id: "r1",
            name: "Recipe",
            createdAt: 1,
            diameter: 20,
            ingredients: [{ id: "i", name: "n", amount: 2 }],
          },
        ],
      },
    }
    expect(CloudDataSchema.safeParse(good).success).toBe(true)
  })
})
