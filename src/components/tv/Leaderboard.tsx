'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BriefcaseBusiness, HeartHandshake, Trophy, Users } from 'lucide-react'
import { LayoutGroup, motion } from 'framer-motion'
import { OutcomeTag } from '@/components/leaderboard/outcome-tag'
import { AnimatedCount } from '@/components/ui/animated-count'
import { TvLeaderboardSoundControls } from '@/components/tv/TvLeaderboardSoundControls'
import { useLeaderboardRealtime } from '@/hooks/use-leaderboard-realtime'
import { useLeaderboardSound } from '@/hooks/use-leaderboard-sound'
import { sortLeaderboardEntries, type LeaderboardCategory, type LeaderboardEntry } from '@/lib/leaderboard'
import {
  getTvRowGridStyle,
  getTvTrophySize,
  tvFs,
  TV_LB_BADGE_WIDTH,
  TV_LB_FONT,
  TV_LB_RANK_WIDTH,
  TV_LB_SCORE_WIDTH,
} from '@/lib/tv-leaderboard-typography'
import { useTvLeaderboardSettings } from '@/stores/use-tv-leaderboard-settings'

const LEADERBOARD_SIZE = 10
const RANK_HIGHLIGHT_MS = 900

const rowTransition = { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.9 }
const layoutTransition = { type: 'spring' as const, stiffness: 380, damping: 28, mass: 1 }

function useRankChangeTracker(
  entries: LeaderboardEntry[],
  onRankChange?: () => void,
) {
  const prevRankMapRef = useRef<Map<string, number>>(new Map())
  const isInitialRef = useRef(true)
  const [rankDeltas, setRankDeltas] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const nextRankMap = new Map<string, number>()
    const deltas = new Map<string, number>()

    entries.forEach((entry, index) => {
      const rank = index + 1
      nextRankMap.set(entry.id, rank)

      const previousRank = prevRankMapRef.current.get(entry.id)
      if (!isInitialRef.current && previousRank !== undefined && previousRank !== rank) {
        deltas.set(entry.id, previousRank - rank)
      }
    })

    prevRankMapRef.current = nextRankMap

    if (!isInitialRef.current && deltas.size > 0) {
      onRankChange?.()
      setRankDeltas(deltas)
    }

    isInitialRef.current = false
  }, [entries, onRankChange])

  useEffect(() => {
    if (rankDeltas.size === 0) {
      return
    }

    const timer = window.setTimeout(() => setRankDeltas(new Map()), RANK_HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [rankDeltas])

  return rankDeltas
}

type ColumnConfig = {
  id: LeaderboardCategory
  title: string
  description: string
  icon: typeof Trophy
  panelClass: string
  headerAccent: string
  iconRing: string
  scoreClass: string
  scoreSuffix?: string
}

const DEFAULT_ROW_SHADOW = '2px 2px 0 0 #42362E'

const RANK_COLUMN_CLASS = 'flex shrink-0 items-center justify-center'
const BADGE_COLUMN_CLASS = 'shrink-0'
const SCORE_COLUMN_CLASS = 'shrink-0 text-right'

const columns: ColumnConfig[] = [
  {
    id: 'capital',
    title: 'Top Tư Bản Lõi',
    description: 'Vốn tích lũy',
    icon: BriefcaseBusiness,
    panelClass: 'bg-[#FFF4E6]',
    headerAccent: 'from-capital/20 to-transparent',
    iconRing: 'bg-capital/25 text-capital',
    scoreClass: 'text-capital',
  },
  {
    id: 'reputation',
    title: 'Top Bậc Thầy Thương Hiệu',
    description: 'Uy tín khách hàng',
    icon: HeartHandshake,
    panelClass: 'bg-[#FCECEC]',
    headerAccent: 'from-reputation/20 to-transparent',
    iconRing: 'bg-reputation/25 text-reputation',
    scoreClass: 'text-reputation',
    scoreSuffix: '/100',
  },
  {
    id: 'laborPower',
    title: 'Top Chủ Tịch Nhân Đạo',
    description: 'Sức lao động đội ngũ',
    icon: Users,
    panelClass: 'bg-[#EEF3EA]',
    headerAccent: 'from-labor/20 to-transparent',
    iconRing: 'bg-labor/25 text-labor',
    scoreClass: 'text-labor',
    scoreSuffix: '/100',
  },
]

const RANK_MOTION_MS = 0.75

const RANK_UP_COLORS = {
  bg: 'rgba(34, 197, 94, 0.28)',
  border: 'rgb(34, 197, 94)',
} as const

const RANK_DOWN_COLORS = {
  bg: 'rgba(239, 68, 68, 0.24)',
  border: 'rgb(239, 68, 68)',
} as const

const getRankColors = (rank: number) => {
  if (rank === 1) {
    return { bg: '#FFF9E6', border: '#D4AF37' }
  }

  if (rank === 2) {
    return { bg: '#FFFFFF', border: '#A7A9AC' }
  }

  if (rank === 3) {
    return { bg: '#FFF8F0', border: '#B87333' }
  }

  return { bg: 'rgba(255, 255, 255, 0.95)', border: 'rgba(66, 54, 46, 0.8)' }
}

const getRowShadow = (rank: number, borderColor: string) =>
  rank <= 3 ? `1px 1px 0 0 ${borderColor}, 2px 2px 0 0 #42362E` : DEFAULT_ROW_SHADOW

function AwardTrophy({ rank, size }: { rank: number; size: number }) {
  if (rank > 3) {
    return (
      <span className="whitespace-nowrap font-black text-secondary/45" style={TV_LB_FONT.rowRank}>
        #{rank}
      </span>
    )
  }

  const className =
    rank === 1 ? 'text-[#D4AF37]' : rank === 2 ? 'text-[#A7A9AC]' : 'text-[#B87333]'

  return <Trophy className={className} size={size} fill="currentColor" strokeWidth={2.4} />
}

type RankItemProps = {
  entry: LeaderboardEntry
  rank: number
  category: LeaderboardCategory
  config: ColumnConfig
  rankDelta?: number
  isReordering?: boolean
  trophySize: number
}

function RankItem({
  entry,
  rank,
  category,
  config,
  rankDelta = 0,
  isReordering = false,
  trophySize,
}: RankItemProps) {
  const score = entry[category]
  const movedUp = rankDelta > 0
  const movedDown = rankDelta < 0
  const hasRankChange = rankDelta !== 0
  const idleColors = getRankColors(rank)
  const rowShadow = getRowShadow(rank, idleColors.border)
  const rankMotionTransition = {
    duration: RANK_MOTION_MS,
    times: [0, 0.38, 1] as [number, number, number],
    ease: 'easeOut' as const,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{
        opacity: 1,
        y: movedUp ? [0, -12, 0] : movedDown ? [0, 8, 0] : 0,
        scale: hasRankChange ? [1, 1.03, 1] : isReordering ? 1.01 : 1,
        backgroundColor: hasRankChange
          ? movedUp
            ? [idleColors.bg, RANK_UP_COLORS.bg, idleColors.bg]
            : [idleColors.bg, RANK_DOWN_COLORS.bg, idleColors.bg]
          : idleColors.bg,
        borderColor: hasRankChange
          ? movedUp
            ? [idleColors.border, RANK_UP_COLORS.border, idleColors.border]
            : [idleColors.border, RANK_DOWN_COLORS.border, idleColors.border]
          : idleColors.border,
      }}
      transition={{
        layout: layoutTransition,
        opacity: { duration: 0.22 },
        y: hasRankChange ? rankMotionTransition : { duration: 0.22 },
        scale: hasRankChange ? rankMotionTransition : { type: 'spring', stiffness: 500, damping: 32 },
        backgroundColor: hasRankChange ? rankMotionTransition : { duration: 0.2 },
        borderColor: hasRankChange ? rankMotionTransition : { duration: 0.2 },
      }}
      className="box-border grid h-full w-full min-h-0 overflow-visible rounded-md border-2 items-center gap-x-1 gap-y-0 px-1.5 py-1 sm:gap-x-1.5 sm:px-2 sm:py-1.5"
      style={{ ...getTvRowGridStyle(), boxShadow: rowShadow }}
    >
      <motion.span
        key={`rank-${rank}`}
        className={RANK_COLUMN_CLASS}
        style={{ width: TV_LB_RANK_WIDTH }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{
          scale: hasRankChange ? [1, 1.12, 1] : 1,
          opacity: 1,
        }}
        transition={{
          ...rowTransition,
          scale: hasRankChange ? { duration: 0.4, times: [0, 0.4, 1] } : rowTransition,
        }}
      >
        <AwardTrophy rank={rank} size={trophySize} />
      </motion.span>
      <span
        className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-extrabold leading-snug text-secondary"
        style={{ ...TV_LB_FONT.rowName, lineHeight: 1.35 }}
        title={entry.playerName}
      >
        {entry.playerName}
      </span>
      <span className={BADGE_COLUMN_CLASS} style={{ width: TV_LB_BADGE_WIDTH }}>
        <OutcomeTag status={entry.status} tvScaled />
      </span>
      <span className={SCORE_COLUMN_CLASS} style={{ width: TV_LB_SCORE_WIDTH }}>
        <AnimatedCount
          value={score}
          suffix={config.scoreSuffix}
          className={`whitespace-nowrap font-black tabular-nums leading-snug ${config.scoreClass}`}
          style={{ ...TV_LB_FONT.rowScore, lineHeight: 1.35 }}
        />
      </span>
    </motion.div>
  )
}

function EmptySlot() {
  return (
    <div
      className="box-border h-full w-full min-h-0 rounded-md border border-dashed border-secondary/15 bg-white/40"
      aria-hidden
    />
  )
}

type LeaderboardColumnProps = {
  config: ColumnConfig
  entries: LeaderboardEntry[]
  isLoading: boolean
  onRankChange?: () => void
  trophySize: number
}

function LeaderboardColumn({ config, entries, isLoading, onRankChange, trophySize }: LeaderboardColumnProps) {
  const Icon = config.icon
  const sortedEntries = useMemo(
    () => sortLeaderboardEntries(entries, config.id),
    [entries, config.id],
  )
  const slots = Array.from({ length: LEADERBOARD_SIZE }, (_, index) => sortedEntries[index] ?? null)
  const rankDeltas = useRankChangeTracker(sortedEntries, onRankChange)
  const [reorderingIds, setReorderingIds] = useState<Set<string>>(new Set())

  const handleLayoutAnimationStart = useCallback((id: string) => {
    setReorderingIds((current) => {
      const next = new Set(current)
      next.add(id)
      return next
    })
  }, [])

  const handleLayoutAnimationComplete = useCallback((id: string) => {
    setReorderingIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }, [])

  return (
    <section
      className={`box-border flex min-h-0 min-w-0 flex-col rounded-2xl border-2 border-secondary shadow-[3px_3px_0_0_#42362E] ${config.panelClass}`}
    >
      <header
        className={`relative shrink-0 overflow-hidden rounded-t-2xl border-b-2 border-secondary/15 bg-gradient-to-b ${config.headerAccent} px-3 py-3 sm:px-4 sm:py-3.5`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex justify-center pr-1 pb-1 sm:mb-2.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-secondary bg-white shadow-[2px_2px_0_0_#42362E] sm:h-12 sm:w-12 ${config.iconRing}`}
            >
              <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={2.5} />
            </div>
          </div>

          <h2
            className="font-display font-extrabold leading-tight tracking-tight text-secondary"
            style={TV_LB_FONT.columnTitle}
            title={config.title}
          >
            {config.title}
          </h2>

          <p
            className="mt-1 font-bold uppercase tracking-[0.14em] text-secondary/55 sm:tracking-[0.16em]"
            style={TV_LB_FONT.columnDescription}
          >
            {config.description}
          </p>
        </div>
      </header>

      <LayoutGroup id={config.id}>
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-2 pb-2.5 sm:gap-1.5 sm:p-2.5 sm:pb-3">
          {!isLoading && sortedEntries.length > 0 ? (
            <div
              className={`grid shrink-0 items-center gap-x-1 px-1.5 sm:gap-x-1.5 sm:px-2`}
              style={getTvRowGridStyle()}
              aria-hidden
            >
              <span
                className={`${RANK_COLUMN_CLASS} font-bold uppercase text-secondary/35`}
                style={{ ...TV_LB_FONT.columnHeaderLabel, width: TV_LB_RANK_WIDTH }}
              >
                #
              </span>
              <span
                className="truncate font-bold uppercase tracking-wide text-secondary/35"
                style={TV_LB_FONT.columnHeaderLabel}
              >
                Tên
              </span>
              <span
                className={`${BADGE_COLUMN_CLASS} text-center font-bold uppercase tracking-wide text-secondary/35`}
                style={{ ...TV_LB_FONT.columnHeaderLabel, width: TV_LB_BADGE_WIDTH }}
              >
                TT
              </span>
              <span
                className={`${SCORE_COLUMN_CLASS} font-bold uppercase tracking-wide text-secondary/35`}
                style={{ ...TV_LB_FONT.columnHeaderLabel, width: TV_LB_SCORE_WIDTH }}
              >
                Điểm
              </span>
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 grid-rows-10 gap-1 overflow-visible p-px sm:gap-1.5">
          {isLoading ? (
            <p
              className="col-span-full row-span-10 flex items-center justify-center font-bold text-secondary/55"
              style={TV_LB_FONT.statusMessage}
            >
              Đang tải...
            </p>
          ) : sortedEntries.length > 0 ? (
            slots.map((entry, index) => (
              <motion.div
                key={entry?.id ?? `empty-${index}`}
                layout="position"
                layoutId={entry ? `${config.id}-${entry.id}` : undefined}
                transition={layoutTransition}
                onLayoutAnimationStart={() => {
                  if (entry) {
                    handleLayoutAnimationStart(entry.id)
                  }
                }}
                onLayoutAnimationComplete={() => {
                  if (entry) {
                    handleLayoutAnimationComplete(entry.id)
                  }
                }}
                style={{ zIndex: entry && (rankDeltas.has(entry.id) || reorderingIds.has(entry.id)) ? 12 : 1 }}
                className="flex min-h-0 min-w-0 items-stretch overflow-visible"
              >
                {entry ? (
                  <RankItem
                    entry={entry}
                    rank={index + 1}
                    category={config.id}
                    config={config}
                    rankDelta={rankDeltas.get(entry.id) ?? 0}
                    isReordering={reorderingIds.has(entry.id)}
                    trophySize={trophySize}
                  />
                ) : (
                  <EmptySlot />
                )}
              </motion.div>
            ))
          ) : (
            <p
              className="col-span-full row-span-10 flex items-center justify-center font-bold text-secondary/55"
              style={TV_LB_FONT.statusMessage}
            >
              Chưa có dữ liệu
            </p>
          )}
          </div>
        </div>
      </LayoutGroup>
    </section>
  )
}

export function Leaderboard() {
  const { data, isLoading, statusCounts } = useLeaderboardRealtime()
  const { playRankChangeSound, previewLeaderboardSound } = useLeaderboardSound()
  const fontScale = useTvLeaderboardSettings((s) => s.fontScale)
  const soundCooldownRef = useRef(false)
  const trophySize = getTvTrophySize(fontScale)

  const handleRankChange = useCallback(() => {
    if (soundCooldownRef.current) {
      return
    }

    soundCooldownRef.current = true
    playRankChangeSound()

    window.setTimeout(() => {
      soundCooldownRef.current = false
    }, 280)
  }, [playRankChangeSound])

  return (
    <main
      className="box-border h-dvh w-full overflow-hidden bg-[#F3EFE8] p-2.5 font-sans text-secondary sm:p-3.5"
      style={{ '--tv-lb-scale': fontScale } as CSSProperties}
    >
      <TvLeaderboardSoundControls onPreview={previewLeaderboardSound} />

      <div className="mx-auto flex h-full w-full max-w-[1920px] min-h-0 flex-col gap-2.5 sm:gap-3">
        <header className="relative shrink-0 px-2 py-0.5 sm:px-3 sm:py-1">
          <div className="flex flex-col items-center text-center">
            <p className="mb-0.5 font-medium text-secondary/45" style={TV_LB_FONT.pageSubtitle}>
              Cập nhật trực tiếp từ các nhà tư bản đang khởi nghiệp
            </p>

            <h1
              className="font-display font-extrabold leading-tight tracking-tight text-secondary"
              style={TV_LB_FONT.pageTitle}
            >
              Bảng{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B8860B] bg-clip-text text-transparent">
                Vàng
              </span>{' '}
              Tư Bản
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:mt-2.5 sm:gap-2.5">
              {[
                { label: 'PLAYING', value: statusCounts.playing, className: 'border-secondary/15 bg-white text-secondary' },
                { label: 'VICTORY', value: statusCounts.victory, className: 'border-[#D4AF37]/40 bg-[#FFF4B8] text-secondary' },
                { label: 'GAME OVER', value: statusCounts.gameOver, className: 'border-secondary/20 bg-ink-200 text-secondary' },
                { label: 'TOTAL', value: statusCounts.total, className: 'border-secondary bg-secondary text-white' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`min-w-[5.5rem] rounded-xl border-2 px-3 py-1.5 text-center shadow-[2px_2px_0_0_#42362E] sm:min-w-[6.5rem] sm:px-4 sm:py-2 ${stat.className}`}
                >
                  <p className="font-extrabold uppercase tracking-wide opacity-85" style={tvFs(10)}>
                    {stat.label}
                  </p>
                  <p className="mt-0.5 font-extrabold tabular-nums leading-none" style={tvFs(22)}>
                    <AnimatedCount value={stat.value} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-3 gap-2.5 sm:gap-3">
          {columns.map((config) => (
            <LeaderboardColumn
              key={config.id}
              config={config}
              entries={data[config.id]}
              isLoading={isLoading}
              onRankChange={handleRankChange}
              trophySize={trophySize}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
