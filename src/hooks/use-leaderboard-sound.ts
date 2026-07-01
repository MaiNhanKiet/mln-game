'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  clampAudioVolume,
  createMediaElementAudioGraph,
  destroyMediaElementAudioGraph,
  playMediaAudio,
  resumeAudioContext,
  setMediaGain,
  unlockMediaAudio,
  type MediaElementAudioGraph,
} from '@/lib/web-audio'
import { useSoundSettings } from '@/stores/use-sound-settings'

const leaderboardSoundUrl = '/sounds/leaderboard.mp3'

export function useLeaderboardSound() {
  const leaderboardSfxEnabled = useSoundSettings((s) => s.leaderboardSfxEnabled)
  const leaderboardSfxVolume = useSoundSettings((s) => s.leaderboardSfxVolume)
  const graphRef = useRef<MediaElementAudioGraph | null>(null)
  const safeVolume = clampAudioVolume(leaderboardSfxVolume)

  useEffect(() => {
    const graph = createMediaElementAudioGraph(leaderboardSoundUrl)
    graphRef.current = graph

    const unlock = () => {
      void unlockMediaAudio(graph)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      destroyMediaElementAudioGraph(graph)
    }
  }, [])

  useEffect(() => {
    void resumeAudioContext()

    const graph = graphRef.current
    if (graph) {
      setMediaGain(graph.gain, safeVolume)
    }
  }, [safeVolume])

  const playRankChangeSound = useCallback(() => {
    const graph = graphRef.current
    if (!graph || !leaderboardSfxEnabled) {
      return
    }

    setMediaGain(graph.gain, safeVolume)
    graph.audio.currentTime = 0
    void playMediaAudio(graph)
  }, [leaderboardSfxEnabled, safeVolume])

  const previewLeaderboardSound = useCallback(() => {
    const graph = graphRef.current
    if (!graph) {
      return
    }

    setMediaGain(graph.gain, safeVolume)
    graph.audio.currentTime = 0
    void playMediaAudio(graph)
  }, [safeVolume])

  return { playRankChangeSound, previewLeaderboardSound }
}
