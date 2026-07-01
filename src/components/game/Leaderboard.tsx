'use client'

import { BriefcaseBusiness, HeartHandshake, RotateCcw, Trophy, Users, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameState } from '@/types/game'
import { formatCapitalUnits } from '@/lib/number-format'
import { useCompletedPlaySession } from '@/hooks/use-client-store'
import { useLeaderboardRealtime } from '@/hooks/use-leaderboard-realtime'
import { sortLeaderboardEntries, mergeCurrentPlayerIntoSnapshot, type LeaderboardCategory, type LeaderboardEntry } from '@/lib/leaderboard'
import { getPlayerStatusFromPhase } from '@/lib/sync-player-state'
import { OutcomeTag } from '@/components/leaderboard/outcome-tag'

type LeaderboardProps = {
  state: GameState
  onRestart: () => void
}

type CategoryConfig = {
  id: LeaderboardCategory
  label: string
  title: string
  description: string
  scoreLabel: string
  Icon: typeof Trophy
}

type AwardTier = 1 | 2 | 3

const categories: CategoryConfig[] = [
  {
    id: 'capital',
    label: 'Vốn',
    title: 'Thương Vụ Bạc Tỷ',
    description: 'Vinh danh những tay tư bản bứt phá để tối đa hóa lợi nhuận.',
    scoreLabel: 'vốn',
    Icon: BriefcaseBusiness,
  },
  {
    id: 'reputation',
    label: 'Uy tín',
    title: 'Thương Hiệu Trăm Năm',
    description: 'Vinh danh nhà sáng lập đặt đạo đức kinh doanh và niềm tin lên trước.',
    scoreLabel: 'uy tín',
    Icon: HeartHandshake,
  },
  {
    id: 'laborPower',
    label: 'Sức lao động',
    title: 'Sếp Quốc Dân',
    description: 'Vinh danh công ty chữa lành, nơi đội ngũ vẫn còn sức để đi đường dài.',
    scoreLabel: 'sức lao động',
    Icon: Users,
  },
]

const getEntryScore = (entry: LeaderboardEntry, category: LeaderboardCategory) => entry[category]

const formatScore = (value: number, category: LeaderboardCategory) =>
  category === 'capital' ? formatCapitalUnits(value) : `${value}/100`

const getAwardTier = (index: number): AwardTier | null => {
  return index < 3 ? ((index + 1) as AwardTier) : null
}

function AwardTrophy({ tier }: { tier: AwardTier }) {
  const className =
    tier === 1 ? 'text-[#D4AF37]' : tier === 2 ? 'text-[#A7A9AC]' : 'text-[#B87333]'

  return <Trophy className={className} size={17} fill="currentColor" strokeWidth={2.6} />
}

const getOutcomeRowClass = (entry: LeaderboardEntry, isCurrentPlayer: boolean) => {
  const statusClass =
    entry.status === 'VICTORY'
      ? 'border-[#D4AF37]/50 bg-[#FFF4B8] text-secondary'
      : entry.status === 'GAME_OVER'
        ? 'border-secondary/20 bg-ink-200 text-secondary'
        : 'border-secondary/15 bg-white text-secondary'
  const currentPlayerClass = isCurrentPlayer ? 'ring-2 ring-accent ring-offset-2 ring-offset-white' : ''

  return `${statusClass} ${currentPlayerClass}`
}

const RANK_COLUMN_CLASS = 'w-11 shrink-0 lg:w-12'
const STATUS_BADGE_COLUMN_CLASS = 'w-[4.75rem] shrink-0 lg:w-[5.25rem]'
const SCORE_COLUMN_CLASS = 'w-14 shrink-0 text-right lg:w-16'
const LEADERBOARD_ROW_GRID_CLASS =
  'grid w-full min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_4.75rem_3.5rem] items-center gap-x-1.5 overflow-hidden sm:gap-x-2 lg:grid-cols-[3rem_minmax(0,1fr)_5.25rem_4rem] lg:gap-x-2.5'

function TruncatablePlayerName({
  name,
  onExpand,
}: {
  name: string
  onExpand: (name: string) => void
}) {
  const nameRef = useRef<HTMLButtonElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  const measureName = useCallback(() => {
    const element = nameRef.current
    if (!element) {
      return
    }

    setIsTruncated(element.scrollWidth > element.clientWidth + 1)
  }, [])

  useEffect(() => {
    measureName()

    const element = nameRef.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver(() => {
      measureName()
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [measureName, name])

  return (
    <button
      ref={nameRef}
      type="button"
      className={`block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left font-extrabold ${
        isTruncated ? 'cursor-pointer text-secondary hover:text-primary' : 'cursor-default text-secondary'
      }`}
      onClick={() => {
        if (isTruncated) {
          onExpand(name)
        }
      }}
      aria-label={isTruncated ? `Xem đầy đủ tên ${name}` : undefined}
    >
      {name}
    </button>
  )
}

export function Leaderboard({ state, onRestart }: LeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('capital')
  const [expandedPlayerName, setExpandedPlayerName] = useState<string | null>(null)
  const alreadyPlayed = useCompletedPlaySession()
  const { data: leaderboardData, playerRanks } = useLeaderboardRealtime(state.gameRunId)

  const mergedLeaderboardData = useMemo(() => {
    if (!state.gameRunId) {
      return leaderboardData
    }

    return mergeCurrentPlayerIntoSnapshot(leaderboardData, {
      id: state.gameRunId,
      playerName: state.shopName,
      capital: state.capital,
      reputation: state.reputation,
      laborPower: state.staffMorale,
      scale: state.scale,
      status: getPlayerStatusFromPhase(state.phase),
    })
  }, [leaderboardData, state])

  const activeConfig = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? categories[0],
    [activeCategory],
  )
  const activeEntries = useMemo(
    () => sortLeaderboardEntries(mergedLeaderboardData[activeCategory] || [], activeCategory),
    [activeCategory, mergedLeaderboardData],
  )
  const ownRank = playerRanks?.[activeCategory] ?? null
  const ownScore = activeCategory === 'laborPower' ? state.staffMorale : state[activeCategory]
  const ActiveIcon = activeConfig.Icon

  useEffect(() => {
    if (!expandedPlayerName) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [expandedPlayerName])

  return (
    <>
    <section className="w-full rounded-game bg-background p-2 sm:p-3 lg:p-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary bg-white shadow-[3px_3px_0_0_#42362E] lg:h-14 lg:w-14">
          <Trophy className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.8} />
        </div>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-none text-secondary lg:mt-4 lg:text-4xl">
          Tổng kết hành trình
        </h2>
        <p className="mt-2 text-xs font-semibold text-secondary/75 sm:text-sm lg:mt-3 lg:text-base">
          Điểm cuối ván đã được tự động ghi nhận vào BXH.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-game bg-white p-1.5 shadow-control lg:mt-5 lg:gap-3 lg:p-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`min-h-10 rounded-control px-2 text-xs font-extrabold transition lg:min-h-11 lg:px-3 lg:text-sm ${
              activeCategory === category.id
                ? 'bg-secondary text-white'
                : 'bg-background text-secondary hover:bg-secondary/10'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <article className="mt-3 min-w-0 rounded-game bg-white p-2 shadow-control sm:mt-4 sm:p-2.5 lg:mt-5 lg:p-4">
        <div className="flex items-start gap-3 lg:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent lg:h-12 lg:w-12">
            <ActiveIcon className="h-[22px] w-[22px] lg:h-6 lg:w-6" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate whitespace-nowrap font-display text-base font-bold leading-tight text-secondary sm:text-lg lg:text-xl">
              {activeConfig.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 text-secondary/70 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
              {activeConfig.description}
            </p>
          </div>
        </div>

        <div className="mt-3 min-w-0 grid gap-2 lg:mt-4 lg:gap-2.5">
          {activeEntries.length > 0 ? (
            activeEntries.map((entry, index) => {
              const awardTier = getAwardTier(index)

              return (
                <div
                  key={entry.id}
                  className={`${LEADERBOARD_ROW_GRID_CLASS} min-h-11 rounded-control border px-2 py-2 text-sm font-extrabold sm:px-2.5 lg:min-h-12 lg:px-3 lg:py-2.5 lg:text-base ${getOutcomeRowClass(
                    entry,
                    entry.id === state.gameRunId,
                  )}`}
                >
                  <span
                    className={`${RANK_COLUMN_CLASS} flex items-center gap-0.5 tabular-nums ${
                      entry.status === 'GAME_OVER' ? 'text-secondary/55' : 'text-secondary/70'
                    }`}
                  >
                    #{index + 1}
                    {awardTier ? <AwardTrophy tier={awardTier} /> : null}
                  </span>
                  <div className="min-w-0 overflow-hidden">
                    <TruncatablePlayerName name={entry.playerName} onExpand={setExpandedPlayerName} />
                  </div>
                  <span className={STATUS_BADGE_COLUMN_CLASS}>
                    <OutcomeTag status={entry.status} />
                  </span>
                  <span className={`${SCORE_COLUMN_CLASS} whitespace-nowrap tabular-nums`}>
                    {formatScore(getEntryScore(entry, activeCategory), activeCategory)}
                  </span>
                </div>
              )
            })
          ) : (
            <p className="rounded-control bg-background px-3 py-4 text-center text-sm font-bold text-secondary/70">
              Chưa có điểm nào được lưu cho bảng này.
            </p>
          )}
        </div>
      </article>

      {state.gameRunId ? (
        <div className="mt-4 rounded-game bg-secondary p-3 text-center text-white shadow-control lg:mt-5 lg:p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-white/65 lg:text-sm">
            Vị trí của bạn
          </p>
          <p className="mt-1 text-sm font-extrabold leading-6 lg:text-base lg:leading-7">
            {ownRank
              ? `Bạn đang ở hạng #${ownRank} với ${formatScore(ownScore as number, activeCategory)} ${activeConfig.scoreLabel}.`
              : `Bạn có ${formatScore(ownScore as number, activeCategory)} ${activeConfig.scoreLabel} — chưa nằm trong top ${activeEntries.length || 10} bảng này.`}
          </p>
        </div>
      ) : null}

      {alreadyPlayed ? (
        <p className="mt-4 rounded-game border-2 border-secondary/15 bg-white px-4 py-3 text-center text-sm font-bold text-secondary/70 shadow-control lg:mt-5 lg:px-5 lg:py-4 lg:text-base">
          Bạn đã hoàn thành ván chơi. Điểm được giữ trên bảng xếp hạng — mỗi người chỉ chơi một lần.
        </p>
      ) : (
        <button
          type="button"
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-game border-2 border-secondary bg-white px-4 py-2 text-sm font-extrabold text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 active:translate-y-0 lg:mt-5 lg:min-h-12 lg:text-base"
          onClick={onRestart}
        >
          <RotateCcw size={18} strokeWidth={2.6} />
          Chơi lại
        </button>
      )}
    </section>

    <AnimatePresence>
      {expandedPlayerName ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[70] bg-secondary/35 backdrop-blur-[2px]"
            aria-label="Đóng tên người chơi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedPlayerName(null)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-name-sheet-title"
            className="fixed left-1/2 z-[80] w-[min(100vw-1.5rem,20rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-secondary/15 bg-white shadow-[0_24px_60px_rgba(66,54,46,0.18)] lg:w-[min(100vw-2rem,24rem)]"
            style={{ top: '50%' }}
            initial={{ y: '55vh', opacity: 0 }}
            animate={{ y: '-50%', opacity: 1 }}
            exit={{ y: '55vh', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-secondary/10 px-4 py-3">
              <h4 id="player-name-sheet-title" className="text-sm font-extrabold text-secondary">
                Tên người chơi
              </h4>
              <button
                type="button"
                onClick={() => setExpandedPlayerName(null)}
                className="rounded-full border border-secondary/15 bg-background px-2.5 py-1 text-xs font-extrabold text-secondary"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.6} />
              </button>
            </div>

            <p className="break-words px-4 py-4 text-base font-extrabold leading-6 text-secondary sm:text-lg">
              {expandedPlayerName}
            </p>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
    </>
  )
}
