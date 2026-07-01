'use client'

import { useEffect, useRef, useState } from 'react'
import { scenarioCards } from '@/data/scenarioCards'
import { useGameStore } from '@/stores/use-game-store'
import type { DecisionDirection } from '@/types/game'
import { createPlayer, getPlayerSnapshotFromState, syncPlayerToApi } from '@/lib/api/player'
import { hasCompletedPlaySession, markPlaySessionCompleted } from '@/lib/play-session'
import { resetMobileViewport } from '@/lib/mobile-viewport'
import { useGameAudio } from '@/hooks/use-game-audio'
import { Leaderboard } from '@/components/game/Leaderboard'
import { ResultModal } from '@/components/game/ResultModal'
import { RulesScreen } from '@/components/game/RulesScreen'
import { GameSoundControls } from '@/components/game/SoundSettingsPanel'
import { StatsHud } from '@/components/game/StatsHud'
import { SwipeScenarioCard } from '@/components/game/SwipeScenarioCard'
import type { SwipeScenarioCardHandle } from '@/components/game/SwipeScenarioCard'

export function GamePrototype() {
  const state = useGameStore()
  const [hasAlreadyPlayed, setHasAlreadyPlayed] = useState(false)
  const swipeCardRef = useRef<SwipeScenarioCardHandle>(null)
  const lastResultSoundKeyRef = useRef<string | null>(null)

  const {
    musicEnabled,
    startBackgroundMusic,
    playEffectSound,
    previewSuccess,
    previewFail,
    successSoundRef,
    failSoundRef,
  } = useGameAudio()

  const activeCard =
    scenarioCards[state.currentCardIndex] ?? scenarioCards[scenarioCards.length - 1]
  const isPlaying = state.phase === 'playing' && !state.pendingResult
  const isSwipeView = isPlaying
  const isResultView = Boolean(state.pendingResult)
  const isLeaderboardView =
    !state.pendingResult && (state.phase === 'victory' || state.phase === 'gameOver')
  const isScrollableView = !isSwipeView && !isResultView
  const displayedShopName = state.shopName || 'Trà Sữa Đại Tư Bản'

  useEffect(() => {
    if (state.phase === 'landing') {
      setHasAlreadyPlayed(hasCompletedPlaySession())
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'playing') {
      resetMobileViewport()
    }
  }, [state.phase])

  useEffect(() => {
    if (!isLeaderboardView) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = ''

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLeaderboardView])

  useEffect(() => {
    if (!isSwipeView) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isSwipeView])

  useEffect(() => {
    if (!state.pendingResult) {
      return
    }

    const resultSoundKey = `${state.currentCardIndex}-${state.pendingResult.direction}-${state.pendingResult.feedback}`

    if (lastResultSoundKeyRef.current === resultSoundKey) {
      return
    }

    lastResultSoundKeyRef.current = resultSoundKey

    const capitalDelta = state.pendingResult.impact.capital ?? 0

    if (capitalDelta > 0) {
      playEffectSound(successSoundRef.current)
    } else if (capitalDelta < 0) {
      playEffectSound(failSoundRef.current)
    }
  }, [failSoundRef, playEffectSound, state.currentCardIndex, state.pendingResult, successSoundRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlaying) {
        return
      }

      if (event.key === 'ArrowLeft') {
        if (musicEnabled) {
          startBackgroundMusic()
        }
        swipeCardRef.current?.swipeLeft()
      }

      if (event.key === 'ArrowRight') {
        if (musicEnabled) {
          startBackgroundMusic()
        }
        swipeCardRef.current?.swipeRight()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, musicEnabled, startBackgroundMusic])

  const syncCurrentPlayer = async (status: 'PLAYING' | 'VICTORY' | 'GAME_OVER') => {
    const current = useGameStore.getState()
    if (!current.gameRunId && !current.shopName) {
      return
    }

    const payload = {
      ...getPlayerSnapshotFromState(current),
      status,
    }

    const sync = async (playerId: string) => syncPlayerToApi(playerId, payload)

    let playerId = current.gameRunId
    let result = playerId ? await sync(playerId) : { ok: false as const, status: 404, error: 'Player not found' }

    if (!result.ok && result.status === 404 && current.shopName) {
      const created = await createPlayer(current.shopName)
      if (!created.ok) {
        console.warn('Không thể tạo lại người chơi:', created.error)
        return
      }

      playerId = created.data.id
      useGameStore.getState().setPlayerId(playerId)
      result = await sync(playerId)
    }

    if (!result.ok) {
      console.warn('Đồng bộ điểm thất bại:', result.error)
    }
  }

  const handleStartGame = async (playerName: string) => {
    const normalizedName = playerName.trim()

    if (!normalizedName || hasCompletedPlaySession()) {
      return
    }

    if (musicEnabled) {
      startBackgroundMusic()
    }

    const player = await createPlayer(normalizedName)
    if (!player.ok) {
      console.warn('Không thể tạo người chơi:', player.error)
      return
    }

    state.startGame(normalizedName, player.data.id)
    resetMobileViewport()
  }

  const handleChoose = (direction: DecisionDirection) => {
    if (!isPlaying) {
      return
    }

    if (musicEnabled) {
      startBackgroundMusic()
    }

    const choice = direction === 'left' ? activeCard.leftChoice : activeCard.rightChoice

    state.applyDecision({
      ...choice,
      cardId: activeCard.id,
      direction,
    })

    void syncCurrentPlayer('PLAYING')
  }

  const handleContinue = async () => {
    if (state.pendingResult?.nextPhase === 'gameOver' || state.pendingResult?.nextPhase === 'victory') {
      const finalStatus = state.pendingResult.nextPhase === 'victory' ? 'VICTORY' : 'GAME_OVER'
      await syncCurrentPlayer(finalStatus)
      markPlaySessionCompleted()
    }
    state.continueAfterResult()
  }

  const handleRestart = () => {
    state.resetGame()
  }

  const soundControls = (
    <GameSoundControls onPreviewSuccess={previewSuccess} onPreviewFail={previewFail} />
  )

  if (state.phase === 'landing') {
    return (
      <>
        {soundControls}
        <RulesScreen onStart={handleStartGame} hasAlreadyPlayed={hasAlreadyPlayed} />
      </>
    )
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background px-3 py-3 font-sans text-secondary sm:px-4 sm:py-4">
      {soundControls}

      <section className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-3 sm:max-w-xl">
        {!isLeaderboardView ? (
          <header className="shrink-0 overflow-visible rounded-game bg-white/90 p-3 shadow-hud ring-1 ring-primary/20 backdrop-blur sm:p-4">
            <p className="text-center text-[11px] font-bold uppercase tracking-wide text-primary sm:text-xs">
              {displayedShopName}
            </p>
            <h1 className="text-center font-display text-xl font-bold leading-tight text-secondary sm:text-2xl">
              &ldquo;Tinder&rdquo; của Nhà Tư Bản
            </h1>
            <div className="mt-2 sm:mt-3">
              <StatsHud state={state} />
            </div>
          </header>
        ) : null}

        <section
          className={`flex min-h-0 flex-1 flex-col ${
            isResultView || isLeaderboardView
              ? 'p-0'
              : 'rounded-game bg-white p-3 shadow-soft ring-1 ring-secondary/10 sm:p-4'
          } ${
            isLeaderboardView
              ? 'overflow-hidden'
              : isScrollableView
                ? 'overflow-y-auto overscroll-contain'
                : 'overflow-hidden'
          }`}
        >
          {state.pendingResult ? (
            <ResultModal
              result={state.pendingResult}
              onContinue={handleContinue}
              continueLabel={
                state.pendingResult.nextPhase === 'victory' ||
                state.pendingResult.nextPhase === 'gameOver'
                  ? 'Xem Bảng Xếp Hạng'
                  : undefined
              }
            />
          ) : state.phase === 'playing' ? (
            <SwipeScenarioCard
              ref={swipeCardRef}
              card={activeCard}
              cardNumber={state.currentCardIndex + 1}
              totalCards={scenarioCards.length}
              disabled={!isPlaying}
              onChoose={handleChoose}
            />
          ) : (
            <Leaderboard state={state} onRestart={handleRestart} />
          )}
        </section>
      </section>
    </main>
  )
}
