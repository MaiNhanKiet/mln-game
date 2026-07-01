'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  emptyLeaderboardSnapshot,
  fetchLeaderboardSnapshot,
  type LeaderboardPlayerRanks,
  type LeaderboardSnapshot,
} from '@/lib/leaderboard'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function useLeaderboardRealtime(playerId?: string | null) {
  const [data, setData] = useState<LeaderboardSnapshot>(emptyLeaderboardSnapshot)
  const [playerRanks, setPlayerRanks] = useState<LeaderboardPlayerRanks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const result = await fetchLeaderboardSnapshot(playerId ?? undefined)
      setData(result.snapshot)
      setPlayerRanks(result.playerRanks)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    setMounted(true)
    void refresh()

    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel('player-leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Player' },
        () => {
          void refresh()
        },
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      setIsLive(false)
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return { data, playerRanks, isLoading, isLive: mounted && isLive, refresh }
}
