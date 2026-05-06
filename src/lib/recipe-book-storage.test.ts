// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { loadRecipes, saveRecipes } from "./recipe-book-storage"

describe("loadRecipes", () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    window.localStorage.clear()
    warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it("round-trips a valid array", () => {
    const recipe = {
      id: "r1",
      name: "Cake",
      createdAt: 123,
      diameter: 20,
      ingredients: [{ id: "i1", name: "Flour", amount: 100 }],
    }
    saveRecipes([recipe])
    expect(loadRecipes()).toEqual([recipe])
    expect(warn).not.toHaveBeenCalled()
  })

  it("returns a default recipe when storage is empty", () => {
    const result = loadRecipes()
    expect(result).toHaveLength(1)
    expect(result[0]?.ingredients).toEqual([])
  })

  it("returns a default recipe when an empty array is stored", () => {
    window.localStorage.setItem("cakeculator-recipe-book", "[]")
    const result = loadRecipes()
    expect(result).toHaveLength(1)
    expect(result[0]?.ingredients).toEqual([])
  })

  it("falls back to default on malformed JSON", () => {
    window.localStorage.setItem("cakeculator-recipe-book", "{not json")
    const result = loadRecipes()
    expect(result).toHaveLength(1)
  })

  it("falls back to default and warns on shape mismatch", () => {
    window.localStorage.setItem(
      "cakeculator-recipe-book",
      JSON.stringify([{ id: "x", name: "missing fields" }]),
    )
    const result = loadRecipes()
    expect(result).toHaveLength(1)
    expect(result[0]?.id).not.toBe("x")
    expect(warn).toHaveBeenCalledOnce()
  })
})
