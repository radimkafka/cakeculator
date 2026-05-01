import { LogIn, LogOut, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export default function UserMenu() {
  const { state, login, logout } = useAuth()

  if (state.status === 'loading') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </span>
    )
  }

  if (state.status === 'idle') {
    return (
      <button
        type="button"
        onClick={login}
        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    )
  }

  const user = state.user
  const isExpired = state.status === 'expired'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {user?.name?.charAt(0) ?? '?'}
            </span>
          )}
          {isExpired && (
            <AlertCircle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-amber-500" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground leading-none">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isExpired ? (
          <DropdownMenuItem onClick={login}>
            <AlertCircle className="text-amber-500" />
            Sign in again
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={logout}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
