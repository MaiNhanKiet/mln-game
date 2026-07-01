import type { PlayerRow } from '@/types/database'

export type LeaderboardCategory = 'capital' | 'reputation' | 'laborPower'

export type LeaderboardEntry = PlayerRow

export type LeaderboardSnapshot = Record<LeaderboardCategory, LeaderboardEntry[]>

export type LeaderboardPlayerRanks = Record<LeaderboardCategory, number | null>

export type LeaderboardFetchResult = {
  snapshot: LeaderboardSnapshot
  playerRanks: LeaderboardPlayerRanks | null
}

const getStatusRank = (status: string) => {
  if (status === 'VICTORY') {
    return 0
  }

  if (status === 'GAME_OVER') {
    return 1
  }

  return 2
}

const getEntryScore = (entry: LeaderboardEntry, category: LeaderboardCategory) => entry[category]

export const sortLeaderboardEntries = (
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
) =>
  [...entries].sort((first, second) => {
    const statusDiff = getStatusRank(first.status) - getStatusRank(second.status)

    if (statusDiff !== 0) {
      return statusDiff
    }

    const scoreDiff = getEntryScore(second, category) - getEntryScore(first, category)

    if (scoreDiff !== 0) {
      return scoreDiff
    }

    const timeDiff = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()

    if (timeDiff !== 0) {
      return timeDiff
    }

    return first.id.localeCompare(second.id)
  })

export const takeTopLeaderboardEntries = (
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
  limit = 10,
) => sortLeaderboardEntries(entries, category).slice(0, limit)

const findPlayerRank = (
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
  playerId: string,
) => {
  const index = sortLeaderboardEntries(entries, category).findIndex((entry) => entry.id === playerId)

  return index >= 0 ? index + 1 : null
}

export const getLeaderboardRanks = (
  entries: LeaderboardEntry[],
  playerId: string,
): LeaderboardPlayerRanks => ({
  capital: findPlayerRank(entries, 'capital', playerId),
  reputation: findPlayerRank(entries, 'reputation', playerId),
  laborPower: findPlayerRank(entries, 'laborPower', playerId),
})

export const emptyLeaderboardSnapshot = (): LeaderboardSnapshot => ({
  capital: [],
  reputation: [],
  laborPower: [],
})

export async function fetchLeaderboardSnapshot(playerId?: string): Promise<LeaderboardFetchResult> {
  const url = playerId
    ? `/api/leaderboard?playerId=${encodeURIComponent(playerId)}`
    : '/api/leaderboard'
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Không thể tải bảng xếp hạng')
  }

  const data = await res.json()

  return {
    snapshot: {
      capital: sortLeaderboardEntries(data.topCapital ?? [], 'capital'),
      reputation: sortLeaderboardEntries(data.topReputation ?? [], 'reputation'),
      laborPower: sortLeaderboardEntries(data.topLaborPower ?? [], 'laborPower'),
    },
    playerRanks: data.playerRanks ?? null,
  }
}
