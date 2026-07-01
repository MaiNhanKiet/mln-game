'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronUp,
  Laugh,
  MessageSquareText,
  PartyPopper,
  SmilePlus,
  TrendingUp,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { MetricDelta, MetricKey, PendingResult } from '@/types/game'

type ResultModalProps = {
  result: PendingResult
  onContinue: () => void
  continueLabel?: string
}

const BLOCK_SECTION_BASE =
  'flex flex-col rounded-xl border border-secondary/15 bg-background p-2.5 sm:p-3 lg:p-4'
const METRICS_SECTION_CLASS = `${BLOCK_SECTION_BASE} shrink-0`
const FEEDBACK_SECTION_CLASS = `${BLOCK_SECTION_BASE} min-h-0 flex-1`
const BLOCK_BODY_TEXT_CLASS = 'text-xs font-semibold leading-5 text-secondary/75 sm:text-sm sm:leading-6 lg:text-base lg:leading-7'

const metricLabels: Partial<Record<MetricKey, string>> = {
  capital: 'Vốn tích lũy',
  reputation: 'Uy tín',
  customerTrust: 'Niềm tin khách hàng',
  staffMorale: 'Sức lao động',
  scale: 'Quy mô',
  profitPerTurn: 'Lãi mỗi lượt',
}

const metricOrder: MetricKey[] = [
  'capital',
  'reputation',
  'customerTrust',
  'staffMorale',
  'scale',
  'profitPerTurn',
]

const getImpactRows = (impact: MetricDelta) =>
  metricOrder
    .map((key) => ({
      key,
      label: metricLabels[key] ?? key,
      value: impact[key],
    }))
    .filter((row): row is { key: MetricKey; label: string; value: number } => {
      return row.value !== undefined && row.value !== 0
    })

export function ResultModal({ result, onContinue, continueLabel = 'Tiếp tục' }: ResultModalProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackOverflows, setFeedbackOverflows] = useState(false)
  const contentColumnRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLElement>(null)
  const feedbackHeaderRef = useRef<HTMLDivElement>(null)
  const feedbackMeasureRef = useRef<HTMLParagraphElement>(null)
  const isTerminal = result.nextPhase === 'victory' || result.nextPhase === 'gameOver'
  const isVictory = result.nextPhase === 'victory'
  const showEndingPopup = isTerminal && Boolean(result.ending)
  const endingPopupLabel = continueLabel ?? 'Xem Bảng Xếp Hạng'
  const Icon = result.nextPhase === 'victory' ? PartyPopper : result.isPositive ? Laugh : TriangleAlert
  const title =
    result.nextPhase === 'victory'
      ? 'Thắng lớn!'
      : result.nextPhase === 'gameOver'
        ? 'Ôi không!'
        : result.isPositive
          ? 'Quyết định thơm như topping'
          : 'Có mùi cháy két'
  const impactRows = getImpactRows(result.impact)
  const swipeLabel = `Quẹt ${result.direction === 'left' ? 'trái' : 'phải'}`

  const measureFeedbackFit = useCallback(() => {
    const column = contentColumnRef.current
    const metrics = metricsRef.current
    const feedbackHeader = feedbackHeaderRef.current
    const measure = feedbackMeasureRef.current
    if (!column || !feedbackHeader || !measure || column.clientHeight === 0) {
      return
    }

    const naturalHeight = measure.offsetHeight
    const metricsHeight = metrics?.offsetHeight ?? 0
    const sectionGap = 8
    const sectionPadding = 20
    const availableHeight =
      column.clientHeight - metricsHeight - sectionGap - feedbackHeader.offsetHeight - sectionPadding

    setFeedbackOverflows(naturalHeight > availableHeight + 1)
  }, [])

  useEffect(() => {
    const column = contentColumnRef.current
    if (!column) {
      return
    }

    const scheduleMeasure = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          measureFeedbackFit()
        })
      })
    }

    scheduleMeasure()

    const observer = new ResizeObserver(() => {
      scheduleMeasure()
    })

    observer.observe(column)
    const metrics = metricsRef.current
    if (metrics) {
      observer.observe(metrics)
    }

    return () => observer.disconnect()
  }, [measureFeedbackFit, result.feedback, impactRows.length, isTerminal, result.ending])

  useEffect(() => {
    if (!feedbackOpen && !showEndingPopup) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [feedbackOpen, showEndingPopup])

  return (
    <>
      <section className="flex h-full min-h-0 w-full flex-col">
        <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-secondary/15 bg-white p-2.5 sm:p-3 lg:p-4 xl:p-5">
          <div className="mb-2.5 shrink-0 sm:mb-3 lg:mb-4">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase leading-none tracking-[0.1em] sm:text-xs">
                  <span className="text-primary">Kết quả:</span>{' '}
                  <span className="text-secondary/55">{swipeLabel}</span>
                </p>

                <h2 className="mt-1.5 font-display text-xl font-extrabold leading-[1.1] text-secondary sm:mt-2 sm:text-2xl lg:text-3xl">
                  {title}
                </h2>
              </div>

              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-secondary/15 sm:h-11 sm:w-11 ${
                  result.isPositive ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
            </div>
          </div>

          <div ref={contentColumnRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            <section ref={metricsRef} className={METRICS_SECTION_CLASS}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4" strokeWidth={2.4} />
                <h3 className="text-xs font-extrabold text-secondary sm:text-sm">Thay đổi chỉ số</h3>
              </div>

              <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-2">
                {impactRows.length > 0 ? (
                  impactRows.map((row) => {
                    const isPositive = row.value > 0

                    return (
                      <div
                        key={row.key}
                        className={`flex min-h-8 items-center justify-between gap-2 rounded-xl border border-secondary/15 px-2.5 py-1.5 sm:min-h-9 sm:px-3 lg:min-h-10 lg:px-3.5 ${
                          isPositive ? 'bg-emerald-50/80' : 'bg-red-50/80'
                        }`}
                      >
                        <span className="min-w-0 truncate text-xs font-extrabold text-secondary">
                          {row.label}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-black tabular-nums ${
                            isPositive ? 'text-emerald-800' : 'text-red-700'
                          }`}
                        >
                          {row.value > 0 ? '+' : ''}
                          {row.value.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="col-span-full rounded-xl border border-secondary/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-secondary/65 sm:text-sm">
                    Không có chỉ số nào thay đổi trực tiếp.
                  </p>
                )}
              </div>
            </section>

            <section className={`relative ${feedbackOverflows ? METRICS_SECTION_CLASS : FEEDBACK_SECTION_CLASS}`}>
              <p
                ref={feedbackMeasureRef}
                aria-hidden
                className={`pointer-events-none invisible absolute inset-x-0 top-0 -z-10 px-2.5 sm:px-3 ${BLOCK_BODY_TEXT_CLASS}`}
              >
                {result.feedback}
              </p>

              <div
                ref={feedbackHeaderRef}
                className={`flex shrink-0 items-center justify-between gap-2 ${feedbackOverflows ? '' : 'mb-1.5'}`}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" strokeWidth={2.4} />
                  <h3 className="text-xs font-extrabold text-secondary sm:text-sm">Nhận xét</h3>
                </div>

                {feedbackOverflows ? (
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold text-primary sm:text-xs"
                    aria-label="Xem đầy đủ nhận xét"
                  >
                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.6} />
                    Chạm để xem đầy đủ
                  </button>
                ) : null}
              </div>

              {!feedbackOverflows ? (
                <p className={BLOCK_BODY_TEXT_CLASS}>{result.feedback}</p>
              ) : null}
            </section>
          </div>

          {!showEndingPopup ? (
            <button
              type="button"
              className="mt-2 inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-secondary/20 bg-primary px-3 py-2 text-sm font-extrabold text-white transition hover:bg-[#9a6b54] active:scale-[0.98] sm:min-h-11 sm:text-base lg:min-h-12 lg:text-lg"
              onClick={onContinue}
            >
              <SmilePlus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              {continueLabel}
            </button>
          ) : null}
        </article>
      </section>

      <AnimatePresence>
        {feedbackOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[70] bg-secondary/35 backdrop-blur-[2px]"
              aria-label="Đóng nhận xét"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFeedbackOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-sheet-title"
              className="fixed left-1/2 z-[80] flex w-[min(100vw-1.5rem,24rem)] max-h-[min(72dvh,28rem)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-secondary/15 bg-white shadow-[0_24px_60px_rgba(66,54,46,0.18)] lg:w-[min(100vw-2rem,28rem)] lg:max-h-[min(75dvh,32rem)]"
              style={{ top: '50%' }}
              initial={{ y: '55vh', opacity: 0 }}
              animate={{ y: '-50%', opacity: 1 }}
              exit={{ y: '55vh', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            >
              <div className="flex shrink-0 items-center justify-center pt-2.5">
                <span className="h-1 w-10 rounded-full bg-secondary/15" aria-hidden />
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-secondary/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" strokeWidth={2.4} />
                  <h4 id="feedback-sheet-title" className="text-sm font-extrabold text-secondary">
                    Nhận xét
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className="rounded-full border border-secondary/15 bg-background px-2.5 py-1 text-xs font-extrabold text-secondary"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.6} />
                </button>
              </div>

              <div className="overflow-y-auto overscroll-contain px-4 py-4">
                <p className="text-sm font-semibold leading-6 text-secondary/80 sm:text-base sm:leading-7">
                  {result.feedback}
                </p>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showEndingPopup && result.ending ? (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-secondary/40 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ending-popup-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-[min(82dvh,32rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-secondary/15 bg-white shadow-[0_24px_60px_rgba(66,54,46,0.18)] sm:max-w-md lg:max-w-lg xl:max-w-xl"
            >
              <div className="flex shrink-0 items-start gap-3 border-b border-secondary/10 px-5 py-4 sm:px-6">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isVictory ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'
                  }`}
                >
                  {isVictory ? (
                    <PartyPopper className="h-5 w-5" strokeWidth={2.4} />
                  ) : (
                    <TriangleAlert className="h-5 w-5" strokeWidth={2.4} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary sm:text-xs">
                    {isVictory ? 'Chiến thắng' : 'Game kết thúc'}
                  </p>
                  <h2
                    id="ending-popup-title"
                    className="mt-1 font-display text-xl font-extrabold leading-tight text-secondary sm:text-2xl"
                  >
                    {isVictory ? 'Thắng lớn!' : 'Ôi không!'}
                  </h2>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold leading-6 text-secondary/80 sm:text-base sm:leading-7">
                  {result.ending}
                </p>
              </div>

              <div className="shrink-0 border-t border-secondary/10 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-secondary/20 bg-primary px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#9a6b54] active:scale-[0.98] sm:min-h-12 sm:text-base"
                  onClick={onContinue}
                >
                  <SmilePlus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  {endingPopupLabel}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
