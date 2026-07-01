'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { applyMetricDelta, resolveGamePhase } from '@/lib/game-rules'
import { initialGameState } from '@/stores/initial-game-state'
import type { ScenarioChoice, GameState, MetricDelta, PendingResult } from '@/types/game'

interface GameStore extends GameState {
  startGame: (shopName: string, playerId?: string) => void
  resetGame: () => void
  continueAfterResult: () => void
  applyDecision: (decision: ScenarioChoice & { cardId: string }) => void
  setPlayerId: (id: string) => void
}

const createGameRunId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const isPositiveImpact = (impact: MetricDelta) => {
  const trackedValues = [
    impact.capital,
    impact.reputation,
    impact.staffMorale,
    impact.scale,
  ].filter((value): value is number => value !== undefined)

  if (trackedValues.length === 0) {
    return false
  }

  return trackedValues.reduce((total, value) => total + value, 0) >= 0
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState,

      setPlayerId: (id: string) => set({ gameRunId: id }),

      startGame: (shopName: string, playerId?: string) => {
        set({
          ...initialGameState,
          gameRunId: playerId || createGameRunId(),
          shopName: shopName.trim(),
          phase: 'playing',
        })
      },

      resetGame: () => set(initialGameState),

      continueAfterResult: () => {
        const state = get()
        if (!state.pendingResult) {
          return
        }

        set({
          phase: state.pendingResult.nextPhase,
          currentCardIndex: state.currentCardIndex + 1,
          pendingResult: null,
          ending: state.pendingResult.ending,
        })
      },

      applyDecision: (actionPayload) => {
        const state = get()
        if (state.phase !== 'playing' || state.pendingResult) {
          return
        }

        if (
          actionPayload.requiresCapitalAtLeast !== undefined &&
          state.capital < actionPayload.requiresCapitalAtLeast
        ) {
          const failureImpact: MetricDelta = {}
          const feedback = actionPayload.failureFeedback ?? actionPayload.feedback
          const ending =
            actionPayload.failureEnding ??
            'Vỡ nợ vì ra quyết định vượt quá sức chịu đựng tài chính.'

          set({
            decisions: [...state.decisions, actionPayload],
            lastFeedback: feedback,
            lastImpact: failureImpact,
            pendingResult: {
              feedback,
              impact: failureImpact,
              nextPhase: 'gameOver',
              ending,
              direction: actionPayload.direction,
              isPositive: false,
            },
          })
          return
        }

        const generatedProfit = state.profitPerTurn
        const updatedState = applyMetricDelta(state, actionPayload.impact)
        const profitImpact: MetricDelta = generatedProfit > 0 ? { capital: generatedProfit } : {}
        const stateWithProfit =
          generatedProfit > 0 ? applyMetricDelta(updatedState, profitImpact) : updatedState
        const combinedImpact: MetricDelta = {
          ...actionPayload.impact,
          capital: (actionPayload.impact.capital ?? 0) + (profitImpact.capital ?? 0),
        }

        const evaluationState = {
          ...stateWithProfit,
          currentCardIndex: state.currentCardIndex + 1,
        }
        const nextPhase = actionPayload.forcedPhase ?? resolveGamePhase(evaluationState)
        const ending =
          nextPhase === 'victory'
            ? actionPayload.victoryEnding ?? actionPayload.ending ?? state.ending
            : nextPhase === 'gameOver'
              ? actionPayload.gameOverEnding ?? actionPayload.ending ?? state.ending
              : state.ending
        const feedback =
          generatedProfit > 0
            ? `${actionPayload.feedback} Lãi vận hành cộng thêm ${generatedProfit.toLocaleString('vi-VN')} vốn.`
            : actionPayload.feedback

        set({
          ...stateWithProfit,
          decisions: [...state.decisions, actionPayload],
          lastFeedback: feedback,
          lastImpact: combinedImpact,
          pendingResult: {
            feedback,
            impact: combinedImpact,
            nextPhase,
            ending,
            direction: actionPayload.direction,
            isPositive: isPositiveImpact(combinedImpact),
          },
        })
      },
    }),
    {
      name: 'mln-game-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
