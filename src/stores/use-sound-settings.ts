'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type SoundSettings = {
  musicEnabled: boolean
  musicVolume: number
  sfxEnabled: boolean
  sfxVolume: number
  leaderboardSfxEnabled: boolean
  leaderboardSfxVolume: number
}

type SoundSettingsStore = SoundSettings & {
  setMusicEnabled: (enabled: boolean) => void
  setMusicVolume: (volume: number) => void
  setSfxEnabled: (enabled: boolean) => void
  setSfxVolume: (volume: number) => void
  setLeaderboardSfxEnabled: (enabled: boolean) => void
  setLeaderboardSfxVolume: (volume: number) => void
  toggleMusic: () => void
  toggleSfx: () => void
  toggleLeaderboardSfx: () => void
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  musicEnabled: true,
  musicVolume: 0.32,
  sfxEnabled: true,
  sfxVolume: 0.75,
  leaderboardSfxEnabled: true,
  leaderboardSfxVolume: 0.65,
}

function clampAudioVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 0.65
  }

  return Math.min(1, Math.max(0, volume))
}

export const useSoundSettings = create<SoundSettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SOUND_SETTINGS,

      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setLeaderboardSfxEnabled: (leaderboardSfxEnabled) => set({ leaderboardSfxEnabled }),
      setLeaderboardSfxVolume: (leaderboardSfxVolume) =>
        set({ leaderboardSfxVolume: Math.min(1, Math.max(0, leaderboardSfxVolume)) }),

      toggleMusic: () => set({ musicEnabled: !get().musicEnabled }),
      toggleSfx: () => set({ sfxEnabled: !get().sfxEnabled }),
      toggleLeaderboardSfx: () => set({ leaderboardSfxEnabled: !get().leaderboardSfxEnabled }),
    }),
    {
      name: 'mln-sound-settings',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SoundSettings>
        return {
          ...currentState,
          ...persisted,
          musicVolume: clampAudioVolume(persisted.musicVolume ?? currentState.musicVolume),
          sfxVolume: clampAudioVolume(persisted.sfxVolume ?? currentState.sfxVolume),
          leaderboardSfxVolume: clampAudioVolume(
            persisted.leaderboardSfxVolume ?? currentState.leaderboardSfxVolume,
          ),
        }
      },
    },
  ),
)
