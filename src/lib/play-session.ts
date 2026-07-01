const HAS_PLAYED_KEY = 'mln-has-played'

export function hasCompletedPlaySession(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(HAS_PLAYED_KEY) === '1'
}

export function markPlaySessionCompleted(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(HAS_PLAYED_KEY, '1')
}
