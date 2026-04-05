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
import type { Recipe } from "#/types/recipe"

type RecipeSwitcherProps = {
  recipes: Recipe[]
  activeRecipe: Recipe
  onSelectRecipe: (id: string) => void
  onCreateRecipe: () => void
  onRenameRecipe: (id: string, name: string) => void
  onCopyRecipe: (id: string) => void
  onDeleteRecipe: (id: string) => void
}

export default function RecipeSwitcher({
  recipes,
  activeRecipe,
  onSelectRecipe,
  onCreateRecipe,
  onRenameRecipe,
  onCopyRecipe,
  onDeleteRecipe,
}: RecipeSwitcherProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  function startEditing() {
    setEditValue(activeRecipe.name)
    setIsEditing(true)
  }

  function saveEdit() {
    const trimmed = editValue.trim()
    onRenameRecipe(activeRecipe.id, trimmed || "Untitled Recipe")
    setIsEditing(false)
  }

  return (
    <div className="mb-6">
      {/* Recipe name — click to edit */}
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
            {activeRecipe.name}
          </h1>
          <button
            type="button"
            onClick={startEditing}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Rename recipe"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Dropdown switcher + New Recipe */}
      <div className="flex items-center gap-2 mt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-border font-bold max-w-[200px]"
            >
              <span className="truncate">{activeRecipe.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] min-w-[200px]"
          >
            {recipes.map((recipe) => (
              <DropdownMenuItem
                key={recipe.id}
                onSelect={() => onSelectRecipe(recipe.id)}
              >
                {recipe.id === activeRecipe.id ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : (
                  <span className="w-4" />
                )}
                <span
                  className={
                    recipe.id === activeRecipe.id ? "font-bold" : ""
                  }
                >
                  {recipe.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onCopyRecipe(activeRecipe.id)}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={recipes.length <= 1}
              onSelect={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onCreateRecipe}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Recipe
        </Button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-2 border-border shadow-[8px_8px_0px_0px_var(--border)] rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete '${activeRecipe.name}' and all its ingredients. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => onDeleteRecipe(activeRecipe.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
