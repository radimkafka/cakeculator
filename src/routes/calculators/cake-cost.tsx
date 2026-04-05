import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/calculators/cake-cost")({
  component: CakeCostLayout,
})

function CakeCostLayout() {
  return <Outlet />
}
