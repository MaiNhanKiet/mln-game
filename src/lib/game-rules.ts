import { GAME_CONFIG } from '@/config/game'
import { theme } from '@/config/theme'
import type { GamePhase, GameState, MetricDelta, MetricKey } from '@/types/game'

export const clampMetric = (value: number) =>
  Math.min(theme.game.maxMetric, Math.max(theme.game.minMetric, value))

export const clampCapital = (value: number) =>
  Math.min(theme.game.maxCapital, Math.max(theme.game.minCapital, value))

export const applyMetricDelta = (state: GameState, impact: MetricDelta): GameState => ({
  ...state,
  capital: clampCapital(state.capital + (impact.capital ?? 0)),
  staffMorale: clampMetric(state.staffMorale + (impact.staffMorale ?? 0)),
  reputation: clampMetric(state.reputation + (impact.reputation ?? 0)),
  customerTrust: clampMetric(state.customerTrust + (impact.customerTrust ?? 0)),
  scale: Math.max(0, state.scale + (impact.scale ?? 0)),
  profitPerTurn: Math.max(0, state.profitPerTurn + (impact.profitPerTurn ?? 0)),
})

export const metricLabels: Record<MetricKey, string> = {
  capital: 'Vốn tích lũy',
  staffMorale: 'Sức lao động',
  reputation: 'Uy tín',
  customerTrust: 'Niềm tin khách hàng',
  scale: 'Quy mô',
  profitPerTurn: 'Lãi mỗi lượt',
}

export const resolveGamePhase = (state: GameState): GamePhase => {
  const hasCriticalFailure =
    state.capital <= 0 ||
    state.staffMorale < GAME_CONFIG.criticalMetricFloor ||
    state.reputation < GAME_CONFIG.criticalMetricFloor ||
    state.customerTrust < GAME_CONFIG.criticalMetricFloor

  if (hasCriticalFailure) {
    return 'gameOver'
  }

  if (state.currentCardIndex >= GAME_CONFIG.totalRounds) {
    return state.capital >= GAME_CONFIG.victoryCapital ? 'victory' : 'gameOver'
  }

  return 'playing'
}
