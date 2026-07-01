'use client'

import { useSyncExternalStore } from 'react'
import { hasCompletedPlaySession } from '@/lib/play-session'

function subscribePlaySession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
  }
}

export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function useCompletedPlaySession() {
  return useSyncExternalStore(
    subscribePlaySession,
    hasCompletedPlaySession,
    () => false,
  )
}
