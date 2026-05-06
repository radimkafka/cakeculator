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
import {
  fetchCloudDataFromDrive,
  loadLastSyncedAt,
  saveLastSyncedAt,
  saveCloudDataToDrive,
  type CloudData,
} from "#/lib/gdrive-storage"
import {
  loadOrders as loadCakeCostOrders,
  saveOrders as saveCakeCostOrders,
} from "#/lib/order-storage"
import {
  loadRecipes as loadRecipeBookRecipes,
  saveRecipes as saveRecipeBookRecipes,
} from "#/lib/recipe-book-storage"

type SyncStatus = "idle" | "fetching" | "saving" | "error" | "saved"

type GDriveSyncContextValue = {
  syncStatus: SyncStatus
  error: string | null
  pendingCloudData: CloudData | null
  saveAllToDrive: () => Promise<void>
  refetchFromDrive: () => Promise<void>
  acceptCloudData: () => CloudData
  dismissCloudData: () => void
}

const GDriveSyncContext = createContext<GDriveSyncContextValue | null>(null)

export function GDriveSyncProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [pendingCloudData, setPendingCloudData] = useState<CloudData | null>(null)
  const inFlightRef = useRef(false)

  const refetchFromDrive = useCallback(async () => {
    if (authState.status !== "authenticated" || !authState.accessToken) return
    if (inFlightRef.current) return
    inFlightRef.current = true

    setSyncStatus("fetching")
    setError(null)

    try {
      const result = await fetchCloudDataFromDrive(authState.accessToken, loadLastSyncedAt())

      if (result) {
        setPendingCloudData(result.data)
      }

      setSyncStatus("idle")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch from Google Drive"
      if (message.includes("401")) {
        setError("Session expired, please log in again")
      } else {
        setError("Could not reach Google Drive")
      }
      setSyncStatus("error")
    } finally {
      inFlightRef.current = false
    }
  }, [authState.status, authState.accessToken])

  useEffect(() => {
    if (authState.status !== "authenticated" || !authState.accessToken) return
    refetchFromDrive()
  }, [authState.status, authState.accessToken, refetchFromDrive])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refetchFromDrive()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [refetchFromDrive])

  const saveAllToDrive = useCallback(
    async () => {
      if (!authState.accessToken) return

      setSyncStatus("saving")
      setError(null)

      try {
        const data: CloudData = {
          schemaVersion: 1,
          cakeCost: { orders: loadCakeCostOrders() },
          recipeBook: { recipes: loadRecipeBookRecipes() },
        }
        await saveCloudDataToDrive(authState.accessToken, data)
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

  const acceptCloudData = useCallback((): CloudData => {
    const data: CloudData = pendingCloudData ?? {
      schemaVersion: 1,
      cakeCost: { orders: [] },
      recipeBook: { recipes: [] },
    }
    saveCakeCostOrders(data.cakeCost.orders)
    saveRecipeBookRecipes(data.recipeBook.recipes)
    setPendingCloudData(null)
    saveLastSyncedAt(Date.now())
    return data
  }, [pendingCloudData])

  const dismissCloudData = useCallback(() => {
    setPendingCloudData(null)
  }, [])

  const value: GDriveSyncContextValue = {
    syncStatus,
    error,
    pendingCloudData,
    saveAllToDrive,
    refetchFromDrive,
    acceptCloudData,
    dismissCloudData,
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
