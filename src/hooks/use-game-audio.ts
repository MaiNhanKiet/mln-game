'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSoundSettings } from '@/stores/use-sound-settings'

const backgroundMusicUrl = '/sounds/musicBackground.mp3'
const successSoundUrl = '/sounds/success.mp3'
const failSoundUrl = '/sounds/fail.mp3'

const FADE_DURATION_MS = 700
const FADE_STEP_MS = 35

export function useGameAudio() {
  const musicEnabled = useSoundSettings((s) => s.musicEnabled)
  const musicVolume = useSoundSettings((s) => s.musicVolume)
  const sfxEnabled = useSoundSettings((s) => s.sfxEnabled)
  const sfxVolume = useSoundSettings((s) => s.sfxVolume)

  const musicRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const failSoundRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<number | null>(null)
  const hasInteractedRef = useRef(false)

  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }, [])

  const fadeMusicTo = useCallback(
    (targetVolume: number, onComplete?: () => void) => {
      const music = musicRef.current
      if (!music) {
        return
      }

      clearFadeTimer()

      const startVolume = music.volume
      const steps = Math.max(1, Math.round(FADE_DURATION_MS / FADE_STEP_MS))
      let currentStep = 0

      fadeTimerRef.current = window.setInterval(() => {
        currentStep += 1
        const progress = Math.min(1, currentStep / steps)
        music.volume = startVolume + (targetVolume - startVolume) * progress

        if (progress >= 1) {
          clearFadeTimer()
          onComplete?.()
        }
      }, FADE_STEP_MS)
    },
    [clearFadeTimer],
  )

  const startBackgroundMusic = useCallback(() => {
    const music = musicRef.current
    if (!music || !musicEnabled) {
      return
    }

    hasInteractedRef.current = true

    if (music.paused) {
      void music.play().catch(() => undefined)
    }

    fadeMusicTo(musicVolume)
  }, [fadeMusicTo, musicEnabled, musicVolume])

  const stopBackgroundMusic = useCallback(() => {
    fadeMusicTo(0, () => {
      musicRef.current?.pause()
    })
  }, [fadeMusicTo])

  const playEffectSound = useCallback(
    (sound: HTMLAudioElement | null) => {
      if (!sfxEnabled || !sound) {
        return
      }

      sound.currentTime = 0
      sound.volume = sfxVolume
      void sound.play().catch(() => undefined)
    },
    [sfxEnabled, sfxVolume],
  )

  const previewSuccess = useCallback(() => {
    if (!successSoundRef.current) {
      return
    }
    const sound = successSoundRef.current
    sound.currentTime = 0
    sound.volume = sfxVolume
    void sound.play().catch(() => undefined)
  }, [sfxVolume])

  const previewFail = useCallback(() => {
    if (!failSoundRef.current) {
      return
    }
    const sound = failSoundRef.current
    sound.currentTime = 0
    sound.volume = sfxVolume
    void sound.play().catch(() => undefined)
  }, [sfxVolume])

  useEffect(() => {
    const music = new Audio(backgroundMusicUrl)
    const success = new Audio(successSoundUrl)
    const fail = new Audio(failSoundUrl)

    music.loop = true
    music.volume = 0
    music.preload = 'auto'
    success.preload = 'auto'
    fail.preload = 'auto'

    musicRef.current = music
    successSoundRef.current = success
    failSoundRef.current = fail

    return () => {
      clearFadeTimer()
      music.pause()
      success.pause()
      fail.pause()
    }
  }, [clearFadeTimer])

  useEffect(() => {
    const music = musicRef.current
    if (!music) {
      return
    }

    if (!musicEnabled) {
      stopBackgroundMusic()
      return
    }

    if (!hasInteractedRef.current) {
      return
    }

    clearFadeTimer()
    music.volume = musicVolume
  }, [musicEnabled, musicVolume, stopBackgroundMusic, clearFadeTimer])

  useEffect(() => {
    const success = successSoundRef.current
    const fail = failSoundRef.current

    if (success) {
      success.volume = sfxVolume
    }

    if (fail) {
      fail.volume = sfxVolume
    }
  }, [sfxVolume])

  useEffect(() => {
    if (!musicEnabled) {
      return
    }

    const unlockAudio = () => {
      startBackgroundMusic()
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [musicEnabled, startBackgroundMusic])

  return {
    musicEnabled,
    sfxEnabled,
    startBackgroundMusic,
    stopBackgroundMusic,
    playEffectSound,
    previewSuccess,
    previewFail,
    successSoundRef,
    failSoundRef,
  }
}
