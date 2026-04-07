import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

type ThemeMode = "light" | "dark"

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") {
    return stored
  }

  // Fall back to device preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light")

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyTheme(initialMode)
  }, [])

  function toggle() {
    const next: ThemeMode = mode === "light" ? "dark" : "light"
    setMode(next)
    applyTheme(next)
    window.localStorage.setItem("theme", next)
  }

  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center rounded-full bg-secondary p-2 text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
    >
      {mode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  )
}
