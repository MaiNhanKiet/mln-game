import type { CSSProperties } from 'react'

/** Font size scaled by --tv-lb-scale on the TV leaderboard root. */
export function tvFs(px: number): CSSProperties {
  return { fontSize: `calc(${px}px * var(--tv-lb-scale, 1))` }
}

export const TV_LB_FONT = {
  headerMeta: tvFs(11),
  pageTitle: tvFs(52),
  pageSubtitle: tvFs(11),
  columnTitle: tvFs(22),
  columnDescription: tvFs(13),
  columnHeaderLabel: tvFs(11),
  rowName: tvFs(14),
  rowScore: tvFs(14),
  rowRank: tvFs(13),
  statusMessage: tvFs(18),
  badge: tvFs(10),
} as const

export const TV_LB_BADGE_WIDTH = 'calc(5.5rem * var(--tv-lb-scale, 1))'
export const TV_LB_SCORE_WIDTH = 'calc(3.75rem * var(--tv-lb-scale, 1))'
export const TV_LB_RANK_WIDTH = 'calc(1.5rem * var(--tv-lb-scale, 1))'

export function getTvRowGridStyle(): CSSProperties {
  return {
    gridTemplateColumns: `${TV_LB_RANK_WIDTH} minmax(0, 1fr) ${TV_LB_BADGE_WIDTH} ${TV_LB_SCORE_WIDTH}`,
  }
}

export function getTvTrophySize(fontScale: number) {
  return Math.round(20 * fontScale)
}

export function clampAudioVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 0.65
  }

  return Math.min(1, Math.max(0, volume))
}
