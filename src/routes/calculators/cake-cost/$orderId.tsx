import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Cloud, Loader2, Plus, RefreshCw, ShoppingBasket } from "lucide-react"
import { useEffect } from "react"
import { Button } from "#/components/ui/button"
import IngredientRow from "#/components/IngredientRow"
import OrderSwitcher from "#/components/OrderSwitcher"
import { useAuth } from "#/contexts/AuthContext"
import { useGDriveSync } from "#/contexts/GDriveSyncContext"
import useOrders from "#/hooks/useOrders"
import { calculateGrandTotal } from "#/lib/calculator"

export const Route = createFileRoute("/calculators/cake-cost/$orderId")({
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const { state: authState } = useAuth()
  const { syncStatus, error: syncError, pendingCloudData, saveAllToDrive, refetchFromDrive, acceptCloudData, dismissCloudData } = useGDriveSync()
  const {
    orders,
    setActiveOrder,
    addIngredient,
    updateIngredient,
    removeIngredient,
    createOrder,
    renameOrder,
    copyOrder,
    deleteOrder,
    replaceOrders,
  } = useOrders()

  // URL is the source of truth for which order is displayed
  const activeOrder = orders.find((o) => o.id === orderId) ?? orders[0]
  const ingredients = activeOrder?.ingredients ?? []

  // Sync hook's activeOrderId so ingredient ops target the right order
  // Also handle invalid order IDs in the URL
  useEffect(() => {
    if (!orders.length) return
    const exists = orders.some((o) => o.id === orderId)
    if (!exists) {
      navigate({
        to: "/calculators/cake-cost/$orderId",
        params: { orderId: orders[0].id },
        replace: true,
      })
      return
    }
    setActiveOrder(orderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]) // intentionally only orderId — avoids feedback loop

  function handleSelectOrder(id: string) {
    navigate({ to: "/calculators/cake-cost/$orderId", params: { orderId: id } })
  }

  function handleCreateOrder() {
    const newId = createOrder()
    navigate({ to: "/calculators/cake-cost/$orderId", params: { orderId: newId } })
  }

  function handleCopyOrder(id: string) {
    const newId = copyOrder(id)
    if (newId) {
      navigate({ to: "/calculators/cake-cost/$orderId", params: { orderId: newId } })
    }
  }

  function handleDeleteOrder(id: string) {
    const nextId = deleteOrder(id)
    if (nextId) {
      navigate({ to: "/calculators/cake-cost/$orderId", params: { orderId: nextId } })
    }
  }

  function handleAcceptCloud() {
    const data = acceptCloudData()
    const cloudOrders = data.cakeCost.orders
    if (cloudOrders.length > 0) {
      replaceOrders(cloudOrders)
      navigate({ to: "/calculators/cake-cost/$orderId", params: { orderId: cloudOrders[0].id } })
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      {pendingCloudData && (
        <div className="bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-secondary-foreground shrink-0" />
            <span className="text-sm font-medium text-secondary-foreground">
              Newer data found in your Google Drive
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleAcceptCloud}>
              Use Cloud
            </Button>
            <Button variant="outline" size="sm" onClick={dismissCloudData}>
              Keep Local
            </Button>
          </div>
        </div>
      )}

      <OrderSwitcher
        orders={orders}
        activeOrder={activeOrder}
        onSelectOrder={handleSelectOrder}
        onCreateOrder={handleCreateOrder}
        onRenameOrder={renameOrder}
        onCopyOrder={handleCopyOrder}
        onDeleteOrder={handleDeleteOrder}
      />

      <div className="flex flex-col gap-3">
        {ingredients.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-md p-8 shadow-[4px_4px_0px_0px_var(--border)] text-center">
            <ShoppingBasket
              size={32}
              className="mx-auto mb-3 text-muted-foreground"
            />
            <p className="font-bold text-foreground">No ingredients yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first ingredient to get started
            </p>
          </div>
        ) : (
          ingredients.map((ingredient) => (
            <IngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              onChange={updateIngredient}
              onRemove={removeIngredient}
            />
          ))
        )}

        <Button
          variant="default"
          size="sm"
          onClick={addIngredient}
          className="self-start"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Ingredient
        </Button>

        {ingredients.length > 0 && (
          <div className="bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] flex justify-between items-center">
            <span className="font-bold text-sm uppercase tracking-wide text-secondary-foreground">
              Total Cost
            </span>
            <span className="font-bold text-lg tabular-nums text-secondary-foreground">
              {calculateGrandTotal(ingredients).toFixed(2)}
            </span>
          </div>
        )}

        {authState.status === "authenticated" && (
          <div className="flex items-center gap-3 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveAllToDrive()}
              disabled={syncStatus === "saving" || syncStatus === "fetching"}
            >
              {syncStatus === "saving" ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4 mr-1.5" />
              )}
              {syncStatus === "saving" ? "Saving..." : "Save to Drive"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchFromDrive()}
              disabled={syncStatus === "saving" || syncStatus === "fetching"}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5${syncStatus === "fetching" ? " animate-spin" : ""}`}
              />
              {syncStatus === "fetching" ? "Refreshing..." : "Refetch"}
            </Button>
            {syncStatus === "saved" && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            {syncStatus === "error" && syncError && (
              <span className="text-xs text-destructive">{syncError}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
