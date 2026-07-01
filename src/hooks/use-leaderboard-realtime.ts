'use client'

import { useCallback, useEffect, useState } from 'react'
import { useIsClient } from '@/hooks/use-client-store'
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
  const isClient = useIsClient()

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
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

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
      window.clearTimeout(timer)
      setIsLive(false)
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return { data, playerRanks, isLoading, isLive: isClient && isLive, refresh }
}
