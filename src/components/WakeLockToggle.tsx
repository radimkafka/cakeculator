import { ChefHat } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "wakeLock"

function isSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator
}

function getInitialEnabled(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return window.localStorage.getItem(STORAGE_KEY) === "on"
}

export default function WakeLockToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!isSupported()) {
      return
    }
    setSupported(true)
    setEnabled(getInitialEnabled())
  }, [])

  useEffect(() => {
    if (!supported) {
      return
    }

    let cancelled = false

    async function acquire() {
      try {
        const sentinel = await navigator.wakeLock.request("screen")
        if (cancelled) {
          await sentinel.release()
          return
        }
        sentinelRef.current = sentinel
      } catch {
        // Browser refused (low battery, OS denial, etc.) — leave the
        // preference as the user set it; visibilitychange will retry.
      }
    }

    async function release() {
      const current = sentinelRef.current
      sentinelRef.current = null
      if (current) {
        try {
          await current.release()
        } catch {
          // Ignore — sentinel may already be released by the browser.
        }
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && enabled && !sentinelRef.current) {
        void acquire()
      }
    }

    if (enabled) {
      void acquire()
      document.addEventListener("visibilitychange", onVisibilityChange)
    } else {
      void release()
    }

    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off")

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibilityChange)
      void release()
    }
  }, [supported, enabled])

  if (!supported) {
    return null
  }

  const label = enabled ? "Allow display to sleep" : "Keep display awake"

  const className = enabled
    ? "inline-flex items-center justify-center rounded-full bg-accent p-2 text-accent-foreground transition-transform hover:scale-105 active:scale-95"
    : "inline-flex items-center justify-center rounded-full bg-secondary p-2 text-secondary-foreground transition-transform hover:scale-105 active:scale-95"

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      className={className}
    >
      <ChefHat className="h-5 w-5" />
    </button>
  )
}
