import { useEffect } from 'react'

/**
 * useFrameworkReady Hook
 *
 * CRITICAL: This hook signals to WebContainer when the app is ready.
 * It MUST be called in the root App component for proper WebContainer integration.
 *
 * The WebContainer runtime looks for window.frameworkReady() to know
 * when the React app has finished its initial render.
 */

declare global {
  interface Window {
    frameworkReady?: () => void
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Signal to WebContainer that the app is ready
    window.frameworkReady?.()
  }, [])
}
