import * as z from "zod/mini"
import { type Order, OrderSchema } from "#/types/order"
import { generateId } from "#/lib/id"
import { parseOrFallback } from "#/lib/safe-parse"

const ORDERS_KEY = "cakeculator-orders"
const ACTIVE_ORDER_KEY = "cakeculator-active-order"

function createDefaultOrder(): Order {
  return {
    id: generateId(),
    name: "Order 1",
    createdAt: Date.now(),
    ingredients: [],
  }
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [createDefaultOrder()]

  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      const orders = parseOrFallback(z.array(OrderSchema), parsed, [], "orders")
      return orders.length > 0 ? orders : [createDefaultOrder()]
    }

    const defaultOrders = [createDefaultOrder()]
    saveOrders(defaultOrders)
    return defaultOrders
  } catch {
    return [createDefaultOrder()]
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  } catch (err) {
    if (err instanceof Error && err.name === "QuotaExceededError") {
      console.warn("[cakeculator] localStorage quota exceeded — orders not saved")
    }
  }
}

export function loadActiveOrderId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(ACTIVE_ORDER_KEY)
  } catch {
    return null
  }
}

export function saveActiveOrderId(id: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ACTIVE_ORDER_KEY, id)
  } catch {
    // Ignore storage errors for active order tracking
  }
}
