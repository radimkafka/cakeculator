import { useState } from "react"
import { Check, ChevronDown, Copy, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import type { Order } from "#/types/order"

type OrderSwitcherProps = {
  orders: Order[]
  activeOrder: Order
  onSelectOrder: (id: string) => void
  onCreateOrder: () => void
  onRenameOrder: (id: string, name: string) => void
  onCopyOrder: (id: string) => void
  onDeleteOrder: (id: string) => void
}

export default function OrderSwitcher({
  orders,
  activeOrder,
  onSelectOrder,
  onCreateOrder,
  onRenameOrder,
  onCopyOrder,
  onDeleteOrder,
}: OrderSwitcherProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  function startEditing() {
    setEditValue(activeOrder.name)
    setIsEditing(true)
  }

  function saveEdit() {
    const trimmed = editValue.trim()
    onRenameOrder(activeOrder.id, trimmed || "Untitled Order")
    setIsEditing(false)
  }

  return (
    <div className="mb-6">
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.currentTarget.blur()
            }
          }}
          autoFocus
          className="bg-background border-2 border-border rounded-md px-3 py-2 text-2xl sm:text-3xl font-sans font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--border)] transition-shadow w-full"
        />
      ) : (
        <div className="flex items-center gap-2">
          <h1
            onClick={startEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") startEditing()
            }}
            tabIndex={0}
            role="button"
            className="font-serif font-bold text-2xl sm:text-3xl cursor-pointer hover:opacity-70 transition-opacity text-foreground"
          >
            {activeOrder.name}
          </h1>
          <button
            type="button"
            onClick={startEditing}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Rename order"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-border font-bold max-w-[200px]"
            >
              <span className="truncate">{activeOrder.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] min-w-[200px]"
          >
            {orders.map((order) => (
              <DropdownMenuItem
                key={order.id}
                onSelect={() => onSelectOrder(order.id)}
              >
                {order.id === activeOrder.id ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : (
                  <span className="w-4" />
                )}
                <span
                  className={
                    order.id === activeOrder.id ? "font-bold" : ""
                  }
                >
                  {order.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onCopyOrder(activeOrder.id)}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={orders.length <= 1}
              onSelect={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onCreateOrder}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Order
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-2 border-border shadow-[8px_8px_0px_0px_var(--border)] rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete '${activeOrder.name}' and all its ingredients. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => onDeleteOrder(activeOrder.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
