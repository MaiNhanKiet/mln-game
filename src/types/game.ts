export type GamePhase = 'landing' | 'playing' | 'victory' | 'gameOver'

export type MetricKey =
  | 'capital'
  | 'staffMorale'
  | 'reputation'
  | 'customerTrust'
  | 'scale'
  | 'profitPerTurn'

export type DecisionDirection = 'left' | 'right'

export type MetricDelta = Partial<Record<MetricKey, number>>

export type ScenarioChoice = {
  label: string
  direction: DecisionDirection
  impact: MetricDelta
  feedback: string
  requiresCapitalAtLeast?: number
  failureFeedback?: string
  failureEnding?: string
  forcedPhase?: Extract<GamePhase, 'victory' | 'gameOver'>
  ending?: string
  victoryEnding?: string
  gameOverEnding?: string
}

export type ScenarioCard = {
  id: string
  title: string
  description: string
  category: 'consumerTrap' | 'laborTrap' | 'growthTrap' | 'ethicsTest' | 'marketShock'
  leftChoice: ScenarioChoice
  rightChoice: ScenarioChoice
}

export type DecisionRecord = ScenarioChoice & {
  cardId: string
}

export type PendingResult = {
  feedback: string
  impact: MetricDelta
  nextPhase: GamePhase
  ending: string | null
  direction: DecisionDirection
  isPositive: boolean
}

export type GameState = {
  phase: GamePhase
  gameRunId: string
  shopName: string
  capital: number
  staffMorale: number
  reputation: number
  customerTrust: number
  scale: number
  profitPerTurn: number
  currentCardIndex: number
  decisions: DecisionRecord[]
  lastFeedback: string | null
  lastImpact: MetricDelta | null
  pendingResult: PendingResult | null
  ending: string | null
}

export type GameAction =
  | { type: 'START_GAME'; payload: { shopName: string } }
  | { type: 'RESET_GAME' }
  | { type: 'CONTINUE_AFTER_RESULT' }
  | {
      type: 'APPLY_DECISION'
      payload: DecisionRecord
    }
