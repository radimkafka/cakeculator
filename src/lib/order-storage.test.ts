// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { loadOrders, saveOrders } from "./order-storage"

describe("loadOrders", () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    window.localStorage.clear()
    warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it("round-trips a valid array", () => {
    const order = {
      id: "o1",
      name: "Birthday cake",
      createdAt: 456,
      ingredients: [{ id: "i1", name: "Sugar", unitPrice: 0.5, amount: 200 }],
    }
    saveOrders([order])
    expect(loadOrders()).toEqual([order])
    expect(warn).not.toHaveBeenCalled()
  })

  it("returns a default order when storage is empty", () => {
    const result = loadOrders()
    expect(result).toHaveLength(1)
    expect(result[0]?.ingredients).toEqual([])
  })

  it("returns a default order when an empty array is stored", () => {
    window.localStorage.setItem("cakeculator-orders", "[]")
    const result = loadOrders()
    expect(result).toHaveLength(1)
  })

  it("falls back to default on malformed JSON", () => {
    window.localStorage.setItem("cakeculator-orders", "{not json")
    const result = loadOrders()
    expect(result).toHaveLength(1)
  })

  it("falls back to default and warns on shape mismatch", () => {
    window.localStorage.setItem(
      "cakeculator-orders",
      JSON.stringify([{ id: "x", ingredients: [{ id: "i", name: "n", amount: 1 }] }]),
    )
    const result = loadOrders()
    expect(result).toHaveLength(1)
    expect(result[0]?.id).not.toBe("x")
    expect(warn).toHaveBeenCalledOnce()
  })
})
