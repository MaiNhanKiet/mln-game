import { useMemo } from 'react'
import { GAME_CONFIG } from '@/config/game'
import type { GameState } from '@/types/game'

export const useGameStatus = (state: GameState) =>
  useMemo(
    () => ({
      isFinished: state.phase === 'victory' || state.phase === 'gameOver',
      progress: Math.min(100, (state.currentCardIndex / GAME_CONFIG.totalRounds) * 100),
      roundsLeft: Math.max(0, GAME_CONFIG.totalRounds - state.currentCardIndex),
    }),
    [state.currentCardIndex, state.phase],
  )
