import { GAME_CONFIG } from '@/config/game'
import type { GameState } from '@/types/game'

export const initialGameState: GameState = {
  phase: 'landing',
  gameRunId: '',
  shopName: '',
  capital: GAME_CONFIG.initialCapital,
  staffMorale: GAME_CONFIG.initialStaffMorale,
  reputation: GAME_CONFIG.initialReputation,
  customerTrust: GAME_CONFIG.defaultMetric,
  scale: GAME_CONFIG.initialScale,
  profitPerTurn: GAME_CONFIG.initialProfitPerTurn,
  currentCardIndex: 0,
  decisions: [],
  lastFeedback: null,
  lastImpact: null,
  pendingResult: null,
  ending: null,
}
