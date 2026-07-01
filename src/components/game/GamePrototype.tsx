'use client'

import { useEffect, useRef } from 'react'
import { scenarioCards } from '@/data/scenarioCards'
import { useGameStore } from '@/stores/use-game-store'
import type { DecisionDirection } from '@/types/game'
import { createPlayer } from '@/lib/api/player'
import { hasCompletedPlaySession, markPlaySessionCompleted } from '@/lib/play-session'
import { resetMobileViewport } from '@/lib/mobile-viewport'
import { getPlayerStatusFromPhase, syncPlayerState } from '@/lib/sync-player-state'
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
  const swipeCardRef = useRef<SwipeScenarioCardHandle>(null)
  const lastResultSoundKeyRef = useRef<string | null>(null)

  const {
    musicEnabled,
    startBackgroundMusic,
    playEffectSound,
    previewSuccess,
    previewFail,
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
    if (state.phase === 'playing') {
      resetMobileViewport()
    }
  }, [state.phase])

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
    if (!isLeaderboardView || !state.gameRunId) {
      return
    }

    if (state.phase !== 'victory' && state.phase !== 'gameOver') {
      return
    }

    void syncPlayerState(getPlayerStatusFromPhase(state.phase))
  }, [isLeaderboardView, state.gameRunId, state.phase])

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
      playEffectSound('success')
    } else if (capitalDelta < 0) {
      playEffectSound('fail')
    }
  }, [playEffectSound, state.currentCardIndex, state.pendingResult])

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
    await syncPlayerState(status)
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
      const finalStatus = getPlayerStatusFromPhase(state.pendingResult.nextPhase)
      await syncPlayerState(finalStatus)
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
        <RulesScreen onStart={handleStartGame} />
      </>
    )
  }

  return (
    <main
      className={`flex flex-col bg-background px-3 py-3 font-sans text-secondary sm:px-4 sm:py-4 lg:px-6 lg:py-5 xl:px-8 ${
        isLeaderboardView ? 'min-h-dvh' : 'h-dvh overflow-hidden'
      }`}
    >
      {soundControls}

      <section
        className={`mx-auto flex w-full max-w-md flex-col gap-3 sm:max-w-xl lg:max-w-2xl lg:gap-4 xl:max-w-3xl ${
          isLeaderboardView ? '' : 'min-h-0 flex-1'
        }`}
      >
        {!isLeaderboardView ? (
          <header className="shrink-0 overflow-visible rounded-game bg-white/90 p-3 shadow-hud ring-1 ring-primary/20 backdrop-blur sm:p-4 lg:p-5">
            <p className="text-center text-[11px] font-bold uppercase tracking-wide text-primary sm:text-xs lg:text-sm">
              {displayedShopName}
            </p>
            <h1 className="text-center font-display text-xl font-bold leading-tight text-secondary sm:text-2xl lg:text-3xl">
              &ldquo;Tinder&rdquo; của Nhà Tư Bản
            </h1>
            <div className="mt-2 sm:mt-3 lg:mt-4">
              <StatsHud state={state} />
            </div>
          </header>
        ) : null}

        <section
          className={`${
            isLeaderboardView ? 'rounded-game bg-background ring-1 ring-secondary/10' : 'flex min-h-0 flex-1 flex-col'
          } ${
            isResultView || isLeaderboardView
              ? 'p-0'
              : 'rounded-game bg-white p-3 shadow-soft ring-1 ring-secondary/10 sm:p-4 lg:p-5'
          } ${
            isLeaderboardView
              ? ''
              : isScrollableView
                ? 'overflow-y-auto overscroll-contain'
                : 'overflow-hidden'
          }`}
        >
          {state.pendingResult ? (
            <ResultModal
              key={`${state.currentCardIndex}-${state.pendingResult.direction}-${state.pendingResult.feedback}`}
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
