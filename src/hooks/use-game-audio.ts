'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  createMediaElementAudioGraph,
  destroyMediaElementAudioGraph,
  fadeMediaGainTo,
  playMediaAudio,
  resumeAudioContext,
  setMediaGain,
  unlockMediaAudio,
  type MediaElementAudioGraph,
} from '@/lib/web-audio'
import { useSoundSettings } from '@/stores/use-sound-settings'

const backgroundMusicUrl = '/sounds/musicBackground.mp3'
const successSoundUrl = '/sounds/success.mp3'
const failSoundUrl = '/sounds/fail.mp3'

const FADE_DURATION_MS = 700

export function useGameAudio() {
  const musicEnabled = useSoundSettings((s) => s.musicEnabled)
  const musicVolume = useSoundSettings((s) => s.musicVolume)
  const sfxEnabled = useSoundSettings((s) => s.sfxEnabled)
  const sfxVolume = useSoundSettings((s) => s.sfxVolume)

  const musicGraphRef = useRef<MediaElementAudioGraph | null>(null)
  const successGraphRef = useRef<MediaElementAudioGraph | null>(null)
  const failGraphRef = useRef<MediaElementAudioGraph | null>(null)
  const hasInteractedRef = useRef(false)

  const fadeMusicTo = useCallback((targetVolume: number, onComplete?: () => void) => {
    const musicGraph = musicGraphRef.current
    if (!musicGraph) {
      return
    }

    fadeMediaGainTo(musicGraph, targetVolume, FADE_DURATION_MS, onComplete)
  }, [])

  const startBackgroundMusic = useCallback(() => {
    const musicGraph = musicGraphRef.current
    if (!musicGraph || !musicEnabled) {
      return
    }

    hasInteractedRef.current = true
    void playMediaAudio(musicGraph)
    fadeMusicTo(musicVolume)
  }, [fadeMusicTo, musicEnabled, musicVolume])

  const stopBackgroundMusic = useCallback(() => {
    fadeMusicTo(0, () => {
      musicGraphRef.current?.audio.pause()
    })
  }, [fadeMusicTo])

  const playEffectSound = useCallback(
    (kind: 'success' | 'fail') => {
      if (!sfxEnabled) {
        return
      }

      const graph = kind === 'success' ? successGraphRef.current : failGraphRef.current
      if (!graph) {
        return
      }

      setMediaGain(graph.gain, sfxVolume)
      graph.audio.currentTime = 0
      void playMediaAudio(graph)
    },
    [sfxEnabled, sfxVolume],
  )

  const previewSuccess = useCallback(() => {
    const graph = successGraphRef.current
    if (!graph) {
      return
    }

    setMediaGain(graph.gain, sfxVolume)
    graph.audio.currentTime = 0
    void playMediaAudio(graph)
  }, [sfxVolume])

  const previewFail = useCallback(() => {
    const graph = failGraphRef.current
    if (!graph) {
      return
    }

    setMediaGain(graph.gain, sfxVolume)
    graph.audio.currentTime = 0
    void playMediaAudio(graph)
  }, [sfxVolume])

  useEffect(() => {
    const musicGraph = createMediaElementAudioGraph(backgroundMusicUrl, {
      loop: true,
      initialVolume: 0,
    })
    const successGraph = createMediaElementAudioGraph(successSoundUrl)
    const failGraph = createMediaElementAudioGraph(failSoundUrl)

    musicGraphRef.current = musicGraph
    successGraphRef.current = successGraph
    failGraphRef.current = failGraph

    const unlock = () => {
      void unlockMediaAudio(musicGraph)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      destroyMediaElementAudioGraph(musicGraph)
      destroyMediaElementAudioGraph(successGraph)
      destroyMediaElementAudioGraph(failGraph)
    }
  }, [])

  useEffect(() => {
    const musicGraph = musicGraphRef.current
    if (!musicGraph) {
      return
    }

    void resumeAudioContext()

    if (!musicEnabled) {
      stopBackgroundMusic()
      return
    }

    if (!hasInteractedRef.current) {
      return
    }

    setMediaGain(musicGraph.gain, musicVolume)
  }, [musicEnabled, musicVolume, stopBackgroundMusic])

  useEffect(() => {
    void resumeAudioContext()

    const successGraph = successGraphRef.current
    const failGraph = failGraphRef.current

    if (successGraph) {
      setMediaGain(successGraph.gain, sfxVolume)
    }

    if (failGraph) {
      setMediaGain(failGraph.gain, sfxVolume)
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
  }
}
