import type { GameState } from '@/types/game'

export type LeaderboardCategory = 'capital' | 'reputation' | 'laborPower'

export type LeaderboardEntry = {
  id: string
  gameRunId: string
  playerName: string
  shopName: string
  capital: number
  reputation: number
  laborPower: number
  outcome: 'victory' | 'gameOver'
  ending: string | null
  createdAt: string
}

export type LeaderboardSnapshot = Record<LeaderboardCategory, LeaderboardEntry[]>

export const LEADERBOARD_UPDATED_EVENT = 'milk-tea-leaderboard-updated'

const LEADERBOARD_STORAGE_KEY = 'milk-tea-capitalist-leaderboard'

const clampScore = (value: number) => Math.min(100, Math.max(0, value))

const getEntryScore = (entry: LeaderboardEntry, category: LeaderboardCategory) => entry[category]

const sortByCategory = (entries: LeaderboardEntry[], category: LeaderboardCategory) => {
  const getStatusRank = (outcome: LeaderboardEntry['outcome']) => {
    if (outcome === 'victory') {
      return 0
    }

    return 1
  }

  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((first, second) => {
      const firstEntry = first.entry
      const secondEntry = second.entry
      const statusDiff = getStatusRank(firstEntry.outcome) - getStatusRank(secondEntry.outcome)

      if (statusDiff !== 0) {
        return statusDiff
      }

      const scoreDiff = getEntryScore(secondEntry, category) - getEntryScore(firstEntry, category)

      if (scoreDiff !== 0) {
        return scoreDiff
      }

      const timeDiff = new Date(firstEntry.createdAt).getTime() - new Date(secondEntry.createdAt).getTime()

      return timeDiff !== 0 ? timeDiff : first.index - second.index
    })
    .map(({ entry }) => entry)
}

const parseEntries = (value: string | null): LeaderboardEntry[] => {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((entry): entry is LeaderboardEntry => {
      return (
        typeof entry?.id === 'string' &&
        typeof entry.gameRunId === 'string' &&
        typeof entry.playerName === 'string' &&
        typeof entry.shopName === 'string' &&
        typeof entry.capital === 'number' &&
        typeof entry.reputation === 'number' &&
        typeof entry.laborPower === 'number' &&
        (entry.outcome === 'victory' || entry.outcome === 'gameOver') &&
        typeof entry.createdAt === 'string'
      )
    })
  } catch {
    return []
  }
}

export const readLeaderboardEntries = () => {
  if (typeof window === 'undefined') {
    return []
  }

  return parseEntries(window.localStorage.getItem(LEADERBOARD_STORAGE_KEY))
}

export const createLeaderboardEntry = (state: GameState, playerName?: string): LeaderboardEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  gameRunId: state.gameRunId,
  playerName: playerName?.trim() || state.shopName || 'Nhà tư bản ẩn danh',
  shopName: state.shopName || 'Trà Sữa Đại Tư Bản',
  capital: state.capital,
  reputation: clampScore(state.reputation),
  laborPower: clampScore(state.staffMorale),
  outcome: state.phase === 'victory' ? 'victory' : 'gameOver',
  ending: state.ending,
  createdAt: new Date().toISOString(),
})

export const saveLeaderboardEntry = (entry: LeaderboardEntry) => {
  if (typeof window === 'undefined') {
    return
  }

  const entries = readLeaderboardEntries()
  const nextEntries = [
    entry,
    ...entries.filter((currentEntry) => currentEntry.gameRunId !== entry.gameRunId),
  ]

  window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(nextEntries))
  window.dispatchEvent(new Event(LEADERBOARD_UPDATED_EVENT))
}

export const getLeaderboardSnapshot = (): LeaderboardSnapshot => {
  const entries = readLeaderboardEntries()

  return {
    capital: sortByCategory(entries, 'capital').slice(0, 10),
    reputation: sortByCategory(entries, 'reputation').slice(0, 10),
    laborPower: sortByCategory(entries, 'laborPower').slice(0, 10),
  }
}

export const getLeaderboardRank = (entryId: string, category: LeaderboardCategory) => {
  const sortedEntries = sortByCategory(readLeaderboardEntries(), category)
  const entryIndex = sortedEntries.findIndex((entry) => entry.id === entryId)

  return entryIndex >= 0 ? entryIndex + 1 : null
}
