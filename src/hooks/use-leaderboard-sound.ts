'use client'

import { useCallback, useEffect, useRef } from 'react'
import { clampAudioVolume } from '@/lib/tv-leaderboard-typography'
import { useSoundSettings } from '@/stores/use-sound-settings'

const leaderboardSoundUrl = '/sounds/leaderboard.mp3'

export function useLeaderboardSound() {
  const leaderboardSfxEnabled = useSoundSettings((s) => s.leaderboardSfxEnabled)
  const leaderboardSfxVolume = useSoundSettings((s) => s.leaderboardSfxVolume)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const safeVolume = clampAudioVolume(leaderboardSfxVolume)

  useEffect(() => {
    const audio = new Audio(leaderboardSoundUrl)
    audio.preload = 'auto'
    audioRef.current = audio

    const unlock = () => {
      void audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
      }).catch(() => undefined)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      audio.pause()
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = safeVolume
    }
  }, [safeVolume])

  const playRankChangeSound = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !leaderboardSfxEnabled) {
      return
    }

    audio.volume = safeVolume
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }, [leaderboardSfxEnabled, safeVolume])

  const previewLeaderboardSound = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.volume = safeVolume
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }, [safeVolume])

  return { playRankChangeSound, previewLeaderboardSound }
}
