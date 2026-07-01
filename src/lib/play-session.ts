export const HAS_PLAYED_STORAGE_KEY = 'mln-has-played'

export function hasCompletedPlaySession(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(HAS_PLAYED_STORAGE_KEY) === '1'
}

export function markPlaySessionCompleted(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(HAS_PLAYED_STORAGE_KEY, '1')
  window.dispatchEvent(new StorageEvent('storage', { key: HAS_PLAYED_STORAGE_KEY }))
}
