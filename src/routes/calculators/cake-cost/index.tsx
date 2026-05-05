import { createFileRoute, redirect } from "@tanstack/react-router"
import { loadActiveOrderId, loadOrders } from "#/lib/order-storage"

export const Route = createFileRoute("/calculators/cake-cost/")({
  beforeLoad() {
    const orders = loadOrders()
    const activeId = loadActiveOrderId()
    const targetId =
      activeId && orders.some((o) => o.id === activeId)
        ? activeId
        : orders[0].id
    throw redirect({
      to: "/calculators/cake-cost/$orderId",
      params: { orderId: targetId },
    })
  },
  component: () => null,
})
