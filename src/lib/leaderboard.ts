import type { PlayerRow } from '@/types/database'

export type LeaderboardCategory = 'capital' | 'reputation' | 'laborPower'

export type LeaderboardEntry = PlayerRow

export type LeaderboardSnapshot = Record<LeaderboardCategory, LeaderboardEntry[]>

export type LeaderboardPlayerRanks = Record<LeaderboardCategory, number | null>

export type LeaderboardFetchResult = {
  snapshot: LeaderboardSnapshot
  playerRanks: LeaderboardPlayerRanks | null
}

/** Win + đang chơi xếp chung theo điểm; game over luôn dưới mọi win (kể cả điểm cao hơn).
 *  Cùng status và cùng điểm: ai cập nhật sớm hơn (updatedAt — hoàn thành câu cuối) xếp trên. */

const getEntryScore = (entry: LeaderboardEntry, category: LeaderboardCategory) => entry[category]

const isGameOverEntry = (entry: LeaderboardEntry) => entry.status === 'GAME_OVER'

const compareByLastUpdateTime = (first: LeaderboardEntry, second: LeaderboardEntry) => {
  const timeDiff = new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime()

  if (timeDiff !== 0) {
    return timeDiff
  }

  return first.id.localeCompare(second.id)
}

const compareLeaderboardEntries = (
  first: LeaderboardEntry,
  second: LeaderboardEntry,
  category: LeaderboardCategory,
) => {
  const firstIsGameOver = isGameOverEntry(first)
  const secondIsGameOver = isGameOverEntry(second)

  if (!firstIsGameOver && secondIsGameOver) {
    return -1
  }

  if (firstIsGameOver && !secondIsGameOver) {
    return 1
  }

  const scoreDiff = getEntryScore(second, category) - getEntryScore(first, category)

  if (scoreDiff !== 0) {
    return scoreDiff
  }

  if (first.status === second.status) {
    return compareByLastUpdateTime(first, second)
  }

  return first.id.localeCompare(second.id)
}

export const sortLeaderboardEntries = (
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
) => [...entries].sort((first, second) => compareLeaderboardEntries(first, second, category))

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

type CurrentPlayerSnapshot = {
  id: string
  playerName: string
  capital: number
  reputation: number
  laborPower: number
  scale: number
  status: string
}

export function mergeCurrentPlayerIntoSnapshot(
  snapshot: LeaderboardSnapshot,
  player: CurrentPlayerSnapshot | null,
): LeaderboardSnapshot {
  if (!player) {
    return snapshot
  }

  const mergeEntries = (entries: LeaderboardEntry[]) => {
    const index = entries.findIndex((entry) => entry.id === player.id)

    if (index < 0) {
      return entries
    }

    const next = [...entries]
    next[index] = {
      ...next[index],
      playerName: player.playerName || next[index].playerName,
      capital: player.capital,
      reputation: player.reputation,
      laborPower: player.laborPower,
      scale: player.scale,
      status: player.status,
    }

    return next
  }

  return {
    capital: mergeEntries(snapshot.capital),
    reputation: mergeEntries(snapshot.reputation),
    laborPower: mergeEntries(snapshot.laborPower),
  }
}

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
