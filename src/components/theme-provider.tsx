"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  themes?: Theme[]
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  systemTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme({
  attribute,
  resolvedTheme,
  themes,
  enableColorScheme,
}: {
  attribute: string
  resolvedTheme: "light" | "dark"
  themes: Theme[]
  enableColorScheme: boolean
}) {
  const root = document.documentElement

  if (attribute === "class") {
    const classNames = themes.filter((t) => t !== "system")
    root.classList.remove(...classNames)
    root.classList.add(resolvedTheme)
  } else {
    root.setAttribute(attribute, resolvedTheme)
  }

  if (enableColorScheme) {
    root.style.colorScheme = resolvedTheme
  }
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  themes = ["light", "dark", "system"],
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    const initial = stored ?? defaultTheme

    const system = getSystemTheme()
    setSystemTheme(system)

    const resolved = initial === "system" ? system : initial
    applyTheme({
      attribute,
      resolvedTheme: resolved,
      themes,
      enableColorScheme,
    })
    setThemeState(initial)

    if (enableSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (event: MediaQueryListEvent) => {
        const nextSystem = event.matches ? "dark" : "light"
        setSystemTheme(nextSystem)
        if (theme === "system") {
          applyTheme({
            attribute,
            resolvedTheme: nextSystem,
            themes,
            enableColorScheme,
          })
        }
      }

      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }

    return undefined
  }, [attribute, defaultTheme, enableColorScheme, enableSystem, storageKey, themes, theme])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      const system = getSystemTheme()
      const resolved = nextTheme === "system" ? system : nextTheme

      applyTheme({
        attribute,
        resolvedTheme: resolved,
        themes,
        enableColorScheme,
      })

      try {
        window.localStorage.setItem(storageKey, nextTheme)
      } catch {}

      setThemeState(nextTheme)
    },
    [attribute, enableColorScheme, storageKey, themes]
  )

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme: theme === "system" ? systemTheme : theme,
      systemTheme,
      setTheme,
      themes,
    }),
    [theme, systemTheme, setTheme, themes]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
