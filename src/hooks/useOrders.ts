import { useEffect, useState } from "react"
import type { Order } from "#/types/order"
import type { Ingredient } from "#/types/ingredient"
import { generateId } from "#/lib/id"
import {
  loadOrders,
  saveOrders,
  loadActiveOrderId,
  saveActiveOrderId,
} from "#/lib/order-storage"

export default function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadOrders)
  const [activeOrderId, setActiveOrderIdState] = useState<string>(() => {
    const saved = loadActiveOrderId()
    const loaded = loadOrders()
    if (saved && loaded.some((o) => o.id === saved)) return saved
    return loaded[0]?.id ?? ""
  })

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  useEffect(() => {
    if (activeOrderId) saveActiveOrderId(activeOrderId)
  }, [activeOrderId])

  const activeOrder = orders.find((o) => o.id === activeOrderId) ?? orders[0]
  const ingredients = activeOrder?.ingredients ?? []

  function createOrder(): string {
    const newOrder: Order = {
      id: generateId(),
      name: `Order ${orders.length + 1}`,
      createdAt: Date.now(),
      ingredients: [],
    }
    setOrders((prev) => [...prev, newOrder])
    setActiveOrderIdState(newOrder.id)
    return newOrder.id
  }

  function renameOrder(id: string, name: string) {
    const safeName = name.trim() || "Untitled Order"
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, name: safeName } : o)),
    )
  }

  function copyOrder(id: string): string | null {
    const source = orders.find((o) => o.id === id)
    if (!source) return null
    const copy: Order = {
      id: generateId(),
      name: `${source.name} (Copy)`,
      createdAt: Date.now(),
      ingredients: source.ingredients.map((ing) => ({ ...ing, id: crypto.randomUUID() })),
    }
    setOrders((prev) => [...prev, copy])
    setActiveOrderIdState(copy.id)
    return copy.id
  }

  function deleteOrder(id: string): string | null {
    if (orders.length <= 1) return null
    const remaining = orders.filter((o) => o.id !== id)
    setOrders(remaining)
    if (activeOrderId === id) {
      const next = remaining[0]
      setActiveOrderIdState(next.id)
      return next.id
    }
    return null
  }

  function setActiveOrder(id: string) {
    if (!orders.some((o) => o.id === id)) return
    setActiveOrderIdState(id)
  }

  function addIngredient() {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId
          ? {
              ...o,
              ingredients: [
                ...o.ingredients,
                { id: crypto.randomUUID(), name: "", unitPrice: 0, amount: 0 },
              ],
            }
          : o,
      ),
    )
  }

  function updateIngredient(id: string, patch: Partial<Omit<Ingredient, "id">>) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId
          ? {
              ...o,
              ingredients: o.ingredients.map((ing) =>
                ing.id === id ? { ...ing, ...patch } : ing,
              ),
            }
          : o,
      ),
    )
  }

  function removeIngredient(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId
          ? { ...o, ingredients: o.ingredients.filter((ing) => ing.id !== id) }
          : o,
      ),
    )
  }

  function replaceOrders(newOrders: Order[]) {
    setOrders(newOrders)
    if (!newOrders.some((o) => o.id === activeOrderId)) {
      setActiveOrderIdState(newOrders[0]?.id ?? "")
    }
  }

  return {
    orders,
    activeOrder,
    activeOrderId,
    ingredients,
    createOrder,
    renameOrder,
    copyOrder,
    deleteOrder,
    setActiveOrder,
    replaceOrders,
    addIngredient,
    updateIngredient,
    removeIngredient,
  }
}
