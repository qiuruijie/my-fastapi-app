import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const THEME_COOKIE_NAME = 'app_theme'

/** 1 year in seconds. */
export const THEME_TTL = 60 * 60 * 24 * 365

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto'
}

/**
 * Server-side: reads the theme mode from the cookie for SSR.
 * Runs inside the root loader so the initial HTML carries the right theme.
 */
export const getTheme = createServerFn({ method: 'GET' }).handler(async () => {
  const value = getCookie(THEME_COOKIE_NAME)
  return isThemeMode(value) ? value : ('auto' as ThemeMode)
})

/**
 * Server-side: persists the theme preference via Set-Cookie response header.
 * This is the most reliable path in TanStack Start — it works in both dev
 * (Vite) and production (Nitro) because the cookie is written by the server.
 */
export const setTheme = createServerFn({ method: 'POST' })
  .validator((value: unknown): ThemeMode =>
    isThemeMode(value) ? value : 'auto',
  )
  .handler(async ({ data }) => {
    setCookie(THEME_COOKIE_NAME, data, {
      httpOnly: true,
      path: '/',
      maxAge: THEME_TTL,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    })
    return data
  })
