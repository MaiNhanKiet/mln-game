'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type SoundSettings = {
  musicEnabled: boolean
  musicVolume: number
  sfxEnabled: boolean
  sfxVolume: number
}

type SoundSettingsStore = SoundSettings & {
  setMusicEnabled: (enabled: boolean) => void
  setMusicVolume: (volume: number) => void
  setSfxEnabled: (enabled: boolean) => void
  setSfxVolume: (volume: number) => void
  toggleMusic: () => void
  toggleSfx: () => void
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  musicEnabled: true,
  musicVolume: 0.32,
  sfxEnabled: true,
  sfxVolume: 0.75,
}

export const useSoundSettings = create<SoundSettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SOUND_SETTINGS,

      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),

      toggleMusic: () => set({ musicEnabled: !get().musicEnabled }),
      toggleSfx: () => set({ sfxEnabled: !get().sfxEnabled }),
    }),
    {
      name: 'mln-sound-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
