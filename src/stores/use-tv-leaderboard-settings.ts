'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const TV_LEADERBOARD_FONT_SCALE_MIN = 0.85
export const TV_LEADERBOARD_FONT_SCALE_MAX = 1.5
export const TV_LEADERBOARD_FONT_SCALE_DEFAULT = 1.15

export type TvLeaderboardFontPreset = 'small' | 'medium' | 'large'

export const TV_LEADERBOARD_FONT_PRESETS: Record<TvLeaderboardFontPreset, number> = {
  small: 1,
  medium: 1.15,
  large: 1.3,
}

type TvLeaderboardSettingsStore = {
  fontScale: number
  setFontScale: (scale: number) => void
  setFontPreset: (preset: TvLeaderboardFontPreset) => void
}

export const useTvLeaderboardSettings = create<TvLeaderboardSettingsStore>()(
  persist(
    (set) => ({
      fontScale: TV_LEADERBOARD_FONT_SCALE_DEFAULT,

      setFontScale: (fontScale) =>
        set({
          fontScale: Math.min(
            TV_LEADERBOARD_FONT_SCALE_MAX,
            Math.max(TV_LEADERBOARD_FONT_SCALE_MIN, fontScale),
          ),
        }),

      setFontPreset: (preset) => set({ fontScale: TV_LEADERBOARD_FONT_PRESETS[preset] }),
    }),
    {
      name: 'mln-tv-leaderboard-settings',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<{ fontScale: number }>
        const fontScale = persisted.fontScale ?? currentState.fontScale

        return {
          ...currentState,
          ...persisted,
          fontScale: Math.min(
            TV_LEADERBOARD_FONT_SCALE_MAX,
            Math.max(TV_LEADERBOARD_FONT_SCALE_MIN, fontScale),
          ),
        }
      },
    },
  ),
)
