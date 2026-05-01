import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useAuth } from "#/contexts/AuthContext"
import { fetchRecipesFromDrive, loadLastSyncedAt, saveLastSyncedAt, saveRecipesToDrive } from "#/lib/gdrive-storage"
import type { Recipe } from "#/types/recipe"

type SyncStatus = "idle" | "fetching" | "saving" | "error" | "saved"

type GDriveSyncContextValue = {
  syncStatus: SyncStatus
  error: string | null
  pendingCloudRecipes: Recipe[] | null
  saveToDrive: (recipes: Recipe[]) => Promise<void>
  acceptCloudRecipes: () => Recipe[]
  dismissCloudRecipes: () => void
}

const GDriveSyncContext = createContext<GDriveSyncContextValue | null>(null)

export function GDriveSyncProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [pendingCloudRecipes, setPendingCloudRecipes] = useState<Recipe[] | null>(null)
  const fetchedRef = useRef(false)

  // Fetch from GDrive once when authenticated
  useEffect(() => {
    if (authState.status !== "authenticated" || !authState.accessToken || fetchedRef.current) return
    fetchedRef.current = true

    let cancelled = false

    async function fetchCloud() {
      setSyncStatus("fetching")
      setError(null)

      try {
        const result = await fetchRecipesFromDrive(authState.accessToken!)
        if (cancelled) return

        if (!result) {
          setSyncStatus("idle")
          return
        }

        const lastSynced = loadLastSyncedAt()

        if (result.modifiedTime > lastSynced) {
          setPendingCloudRecipes(result.recipes)
        }

        setSyncStatus("idle")
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Failed to fetch from Google Drive"
        if (message.includes("401")) {
          setError("Session expired, please log in again")
        } else {
          setError("Could not reach Google Drive")
        }
        setSyncStatus("error")
      }
    }

    fetchCloud()
    return () => { cancelled = true }
  }, [authState.status, authState.accessToken])

  const saveToDrive = useCallback(
    async (recipes: Recipe[]) => {
      if (!authState.accessToken) return

      setSyncStatus("saving")
      setError(null)

      try {
        await saveRecipesToDrive(authState.accessToken, recipes)
        saveLastSyncedAt(Date.now())
        setSyncStatus("saved")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Save failed"
        if (message.includes("401")) {
          setError("Session expired, please log in again")
        } else {
          setError("Save failed, try again")
        }
        setSyncStatus("error")
      }
    },
    [authState.accessToken],
  )

  const acceptCloudRecipes = useCallback((): Recipe[] => {
    const recipes = pendingCloudRecipes ?? []
    setPendingCloudRecipes(null)
    saveLastSyncedAt(Date.now())
    return recipes
  }, [pendingCloudRecipes])

  const dismissCloudRecipes = useCallback(() => {
    setPendingCloudRecipes(null)
  }, [])

  const value: GDriveSyncContextValue = {
    syncStatus,
    error,
    pendingCloudRecipes,
    saveToDrive,
    acceptCloudRecipes,
    dismissCloudRecipes,
  }

  return (
    <GDriveSyncContext.Provider value={value}>
      {children}
    </GDriveSyncContext.Provider>
  )
}

export function useGDriveSync(): GDriveSyncContextValue {
  const ctx = useContext(GDriveSyncContext)
  if (!ctx) throw new Error("useGDriveSync must be used within GDriveSyncProvider")
  return ctx
}
