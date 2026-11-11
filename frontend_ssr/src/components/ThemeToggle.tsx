import { useEffect, useState } from 'react'
import { Route } from '../routes/__root'
import { setTheme, type ThemeMode } from '../lib/theme-server'

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const { theme: serverTheme } = Route.useLoaderData()
  const [mode, setMode] = useState<ThemeMode>(serverTheme)

  // Keep local state in sync if the server value changes (e.g. after reload).
  useEffect(() => {
    setMode(serverTheme)
    applyThemeMode(serverTheme)
  }, [serverTheme])

  // When in 'auto' mode, react to system preference changes.
  useEffect(() => {
    if (mode !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  async function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'

    // Optimistic update for instant feedback.
    setMode(nextMode)
    applyThemeMode(nextMode)

    try {
      await setTheme({ data: nextMode })
    } catch {
      // Roll back on failure.
      setMode(mode)
      applyThemeMode(mode)
    }
  }

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
