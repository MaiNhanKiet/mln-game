'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Rocket, Target } from 'lucide-react'
import { GAME_CONFIG } from '@/config/game'
import { GameRulesContent } from '@/components/game/GameRulesContent'
import { formatCapitalUnits } from '@/lib/number-format'
import { useCompletedPlaySession } from '@/hooks/use-client-store'
import { resetMobileViewport } from '@/lib/mobile-viewport'

type RulesScreenProps = {
  onStart: (name: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const START_NOTE_SECONDS = 15

export function RulesScreen({ onStart }: RulesScreenProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const alreadyPlayed = useCompletedPlaySession()
  const [showStartNote, setShowStartNote] = useState(false)
  const [noteSecondsLeft, setNoteSecondsLeft] = useState(START_NOTE_SECONDS)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const pendingNameRef = useRef('')
  const hasStartedRef = useRef(false)

  const finishStartNote = useCallback(() => {
    if (hasStartedRef.current || !pendingNameRef.current) {
      return
    }

    hasStartedRef.current = true
    const playerName = pendingNameRef.current
    pendingNameRef.current = ''
    setShowStartNote(false)
    resetMobileViewport()
    onStart(playerName)
  }, [onStart])

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      nameInputRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    if (!showStartNote) {
      return
    }

    const intervalId = window.setInterval(() => {
      setNoteSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    const timeoutId = window.setTimeout(() => {
      finishStartNote()
    }, START_NOTE_SECONDS * 1000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [finishStartNote, showStartNote])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (alreadyPlayed) {
      setError('Bạn đã hoàn thành ván chơi. Mỗi người chỉ được chơi một lần!')
      return
    }

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Vui lòng nhập tên nhà tư bản trước khi bắt đầu!')
      return
    }

    setError('')
    nameInputRef.current?.blur()
    resetMobileViewport()
    pendingNameRef.current = trimmed
    hasStartedRef.current = false
    setNoteSecondsLeft(START_NOTE_SECONDS)
    setShowStartNote(true)
  }

  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-[#F8F5E9] px-3 py-3 font-sans sm:items-center sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
      <motion.div
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center sm:max-w-lg lg:max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.article
          variants={itemVariants}
          className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(66,54,46,0.12)] ring-1 ring-stone-200/80 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl lg:max-h-[min(92dvh,44rem)]"
        >
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
            <GameRulesContent />
          </div>

          <motion.form
            variants={itemVariants}
            className="shrink-0 space-y-2.5 border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur-sm sm:space-y-3 sm:px-6 sm:py-5 md:px-8"
            onSubmit={handleSubmit}
          >
            {alreadyPlayed ? (
              <div className="rounded-2xl border-2 border-secondary/20 bg-stone-50 px-4 py-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success" strokeWidth={2.4} />
                <p className="mt-2 text-sm font-extrabold text-secondary">Bạn đã hoàn thành ván chơi</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-secondary/70">
                  Điểm của bạn vẫn hiển thị trên bảng xếp hạng. Mỗi thiết bị chỉ được chơi một lần.
                </p>
              </div>
            ) : (
              <>
            <label className="block">
              <span className="sr-only">Tên nhà tư bản</span>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (error) setError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    nameInputRef.current?.blur()
                    resetMobileViewport()
                  }
                }}
                placeholder="Nhập tên nhà tư bản của bạn..."
                maxLength={32}
                enterKeyHint="done"
                autoComplete="nickname"
                className="h-11 w-full rounded-full border-2 border-stone-200 bg-white px-4 text-base font-semibold text-secondary outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:h-12 sm:px-5 lg:h-12 lg:text-lg"
              />
            </label>

            {error ? (
              <p className="text-center text-xs font-semibold text-red-600 sm:text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={showStartNote}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-secondary bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_0_#42362E] transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-[#9a6b54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-6 sm:py-3.5 sm:text-base"
            >
              <Rocket className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.5} />
              Bắt Đầu Khởi Nghiệp
            </button>
              </>
            )}
          </motion.form>
        </motion.article>
      </motion.div>

      {showStartNote ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-note-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm rounded-2xl border-2 border-primary/25 bg-white p-5 shadow-[0_20px_60px_rgba(66,54,46,0.18)] sm:max-w-md sm:p-6 lg:max-w-lg lg:p-7"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Target className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary sm:text-xs">
                  Ghi chú quan trọng
                </p>
                <h2
                  id="start-note-title"
                  className="mt-1 font-display text-xl font-extrabold leading-tight text-secondary sm:text-2xl"
                >
                  Mục tiêu chiến thắng
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm font-bold leading-6 text-secondary sm:text-base sm:leading-7">
              Sau{' '}
              <span className="text-primary">{GAME_CONFIG.totalRounds} câu hỏi</span>, giữ vốn từ{' '}
              <span className="text-primary">{formatCapitalUnits(GAME_CONFIG.victoryCapital)}</span> trở lên
              và các chỉ số còn trên 0 để chiến thắng. Hết vốn hoặc chỉ số về 0 là thua cuộc!
            </p>

            <p className="mt-4 text-center text-xs font-extrabold text-secondary/55 sm:text-sm">
              Tự tiếp tục sau {noteSecondsLeft}s
            </p>

            <button
              type="button"
              onClick={finishStartNote}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-secondary bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_0_#42362E] transition-transform hover:scale-[1.02] hover:bg-[#9a6b54] active:scale-[0.98] sm:min-h-12 sm:text-base"
            >
              <ArrowRight className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.6} />
              Tiếp tục
            </button>
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}
