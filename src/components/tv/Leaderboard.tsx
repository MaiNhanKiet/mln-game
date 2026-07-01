'use client'

import { useEffect, useRef } from 'react'
import { BriefcaseBusiness, HeartHandshake, Trophy, Users } from 'lucide-react'
import { LayoutGroup, motion } from 'framer-motion'
import { AnimatedCount } from '@/components/ui/animated-count'
import { useLeaderboardRealtime } from '@/hooks/use-leaderboard-realtime'
import type { LeaderboardCategory, LeaderboardEntry } from '@/lib/leaderboard'

const LEADERBOARD_SIZE = 10

const rowTransition = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.85 }

function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
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

const getRankStyle = (rank: number) => {
  if (rank === 1) {
    return 'border-[#D4AF37] bg-[#FFF9E6]'
  }
  if (rank === 2) {
    return 'border-[#A7A9AC] bg-white'
  }
  if (rank === 3) {
    return 'border-[#B87333] bg-[#FFF8F0]'
  }
  return 'border-secondary/80 bg-white/95'
}

function AwardTrophy({ rank }: { rank: number }) {
  if (rank > 3) {
    return <span className="whitespace-nowrap text-[10px] font-black text-secondary/45 sm:text-xs">#{rank}</span>
  }

  const className =
    rank === 1 ? 'text-[#D4AF37]' : rank === 2 ? 'text-[#A7A9AC]' : 'text-[#B87333]'

  return <Trophy className={className} size={16} fill="currentColor" strokeWidth={2.4} />
}

type RankItemProps = {
  entry: LeaderboardEntry
  rank: number
  category: LeaderboardCategory
  config: ColumnConfig
}

function RankItem({ entry, rank, category, config }: RankItemProps) {
  const score = entry[category]
  const prevScore = usePrevious(score)
  const scoreDelta = prevScore === undefined ? 0 : score - prevScore

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow:
          scoreDelta !== 0
            ? '2px 2px 0 0 #42362E, 0 0 0 2px rgba(176, 125, 98, 0.35)'
            : '2px 2px 0 0 #42362E',
      }}
      transition={{
        opacity: { duration: 0.28 },
        y: { duration: 0.28 },
        scale: { duration: 0.28 },
        boxShadow: { duration: 0.45 },
      }}
      className={`box-border grid h-full w-full min-h-0 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-1.5 rounded-lg border-2 px-2 py-1 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-2 sm:px-2.5 sm:py-1.5 ${getRankStyle(rank)}`}
    >
      <motion.span
        key={`rank-${rank}`}
        className="flex items-center justify-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={rowTransition}
      >
        <AwardTrophy rank={rank} />
      </motion.span>
      <span className="flex min-w-0 items-center gap-1.5">
        {entry.status === 'PLAYING' ? (
          <span
            className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-success"
            title="Đang chơi"
            aria-hidden
          />
        ) : entry.status === 'VICTORY' ? (
          <span className="shrink-0 text-[9px] font-black text-success" title="Đã hoàn thành">
            ✓
          </span>
        ) : (
          <span className="shrink-0 text-[9px] font-black text-secondary/35" title="Đã chơi">
            •
          </span>
        )}
        <span
          className="truncate whitespace-nowrap text-[11px] font-extrabold text-secondary sm:text-sm"
          title={entry.playerName}
        >
          {entry.playerName}
        </span>
      </span>
      <AnimatedCount
        value={score}
        suffix={config.scoreSuffix}
        className={`shrink-0 whitespace-nowrap text-[11px] font-black tabular-nums sm:text-sm ${config.scoreClass}`}
      />
    </motion.div>
  )
}

function EmptySlot() {
  return (
    <div
      className="box-border h-full w-full min-h-0 rounded-lg border-2 border-dashed border-secondary/15 bg-white/40"
      aria-hidden
    />
  )
}

type LeaderboardColumnProps = {
  config: ColumnConfig
  entries: LeaderboardEntry[]
  isLoading: boolean
}

function LeaderboardColumn({ config, entries, isLoading }: LeaderboardColumnProps) {
  const Icon = config.icon
  const slots = Array.from({ length: LEADERBOARD_SIZE }, (_, index) => entries[index] ?? null)

  return (
    <section
      className={`box-border flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-secondary shadow-[3px_3px_0_0_#42362E] ${config.panelClass}`}
    >
      <header
        className={`relative shrink-0 overflow-visible rounded-t-2xl border-b-2 border-secondary/15 bg-gradient-to-b ${config.headerAccent} px-3 py-3 sm:px-4 sm:py-3.5`}
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
            className="font-display text-base font-extrabold leading-tight tracking-tight text-secondary sm:text-lg lg:text-xl"
            title={config.title}
          >
            {config.title}
          </h2>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary/55 sm:text-xs sm:tracking-[0.16em]">
            {config.description}
          </p>
        </div>
      </header>

      <LayoutGroup id={config.id}>
        <div className="grid min-h-0 flex-1 grid-rows-10 gap-1.5 p-2 pb-2.5 pr-2.5 sm:gap-1.5 sm:p-2.5 sm:pb-3 sm:pr-3">
          {isLoading ? (
            <p className="col-span-full row-span-10 flex items-center justify-center text-sm font-bold text-secondary/55">
              Đang tải...
            </p>
          ) : entries.length > 0 ? (
            slots.map((entry, index) => (
              <motion.div
                key={entry?.id ?? `empty-${index}`}
                layout="position"
                transition={rowTransition}
                className="flex min-h-0 min-w-0 items-stretch"
              >
                {entry ? (
                  <RankItem entry={entry} rank={index + 1} category={config.id} config={config} />
                ) : (
                  <EmptySlot />
                )}
              </motion.div>
            ))
          ) : (
            <p className="col-span-full row-span-10 flex items-center justify-center text-sm font-bold text-secondary/55">
              Chưa có dữ liệu
            </p>
          )}
        </div>
      </LayoutGroup>
    </section>
  )
}

export function Leaderboard() {
  const { data, isLoading, isLive } = useLeaderboardRealtime()

  return (
    <main className="box-border h-dvh w-full overflow-hidden bg-[#F3EFE8] p-2.5 font-sans text-secondary sm:p-3.5">
      <div className="mx-auto flex h-full w-full max-w-[1920px] min-h-0 flex-col gap-2.5 sm:gap-3">
        <header className="relative shrink-0 px-2 py-1 sm:px-3 sm:py-1.5">
          <div className="flex flex-col items-center text-center">
            <p className="inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-secondary/50 sm:text-[9px]">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${isLive ? 'animate-pulse bg-success' : 'bg-secondary/20'}`}
                aria-hidden
              />
              Bảng xếp hạng realtime
            </p>

            <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight text-secondary sm:mt-1.5 sm:text-5xl lg:text-6xl">
              Bảng{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B8860B] bg-clip-text text-transparent">
                Vàng
              </span>{' '}
              Tư Bản
            </h1>

            <p className="mt-1 text-[8px] font-medium text-secondary/45 sm:text-[9px]">
              Cập nhật trực tiếp từ các nhà tư bản đang khởi nghiệp
            </p>
          </div>
        </header>

        <div className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-3 gap-2.5 sm:gap-3">
          {columns.map((config) => (
            <LeaderboardColumn
              key={config.id}
              config={config}
              entries={data[config.id]}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
