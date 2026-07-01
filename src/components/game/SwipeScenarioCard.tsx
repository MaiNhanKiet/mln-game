'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion, useAnimation, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { DecisionDirection, ScenarioCard } from '@/types/game'

const QUESTION_TIME_LIMIT_MS = 30000;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_CHOICE_BASE =
  'pressable rounded-game px-3 py-3.5 text-left text-base font-extrabold transition active:scale-95 sm:text-lg lg:px-4 lg:py-4 lg:text-xl'

type SwipeScenarioCardProps = {
  card: ScenarioCard;
  cardNumber: number;
  totalCards: number;
  disabled: boolean;
  onChoose: (direction: DecisionDirection) => void;
};

export type SwipeScenarioCardHandle = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

export const SwipeScenarioCard = forwardRef<
  SwipeScenarioCardHandle,
  SwipeScenarioCardProps
>(function SwipeScenarioCard(
  { card, cardNumber, totalCards, disabled, onChoose },
  ref,
) {
  const [remainingMs, setRemainingMs] = useState(QUESTION_TIME_LIMIT_MS);
  const didChooseRef = useRef(false);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const progressPercent = (remainingMs / QUESTION_TIME_LIMIT_MS) * 100;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const controls = useAnimation();

  const chooseDirection = useCallback(
    async (direction: DecisionDirection) => {
      if (disabled || didChooseRef.current) {
        return;
      }

      didChooseRef.current = true;
      const targetX = direction === "left" ? -window.innerWidth : window.innerWidth;
      
      await controls.start({
        x: targetX,
        transition: { duration: 0.3 }
      });
      
      window.setTimeout(() => onChoose(direction), 120);
    },
    [disabled, onChoose, controls],
  );

  useEffect(() => {
    didChooseRef.current = false;
    controls.set({ x: 0 });
    x.set(0);
    setRemainingMs(QUESTION_TIME_LIMIT_MS);
  }, [card.id, controls, x]);

  useEffect(() => {
    if (disabled || didChooseRef.current) {
      return;
    }

    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      const nextRemainingMs = Math.max(
        0,
        QUESTION_TIME_LIMIT_MS - (Date.now() - startedAt),
      );

      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        window.clearInterval(timerId);
        chooseDirection("left");
      }
    }, 100);

    return () => window.clearInterval(timerId);
  }, [card.id, chooseDirection, disabled]);

  useImperativeHandle(
    ref,
    () => ({
      swipeLeft: () => chooseDirection("left"),
      swipeRight: () => chooseDirection("right"),
    }),
    [chooseDirection],
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset > SWIPE_DISTANCE_THRESHOLD) {
      chooseDirection("right");
    } else if (offset < -SWIPE_DISTANCE_THRESHOLD) {
      chooseDirection("left");
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.article
          className="absolute inset-0 flex select-none flex-col overflow-hidden rounded-game bg-white p-3 ring-1 ring-secondary/10 will-change-transform cursor-grab active:cursor-grabbing sm:p-4 lg:p-5 xl:p-6"
          drag={disabled ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragDirectionLock
          dragElastic={0.85}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x, rotate, touchAction: 'none' }}
        >
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/20" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/20" />

        <div className="pointer-events-none relative shrink-0">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:mb-3 sm:gap-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-accent sm:text-[11px]">
              Tình huống {cardNumber}/{totalCards}
            </p>
            <p
              className={`rounded-full border-2 border-secondary bg-white px-2 py-0.5 text-[11px] font-black tabular-nums shadow-[2px_2px_0_0_#42362E] sm:py-1 sm:text-xs ${
                remainingSeconds <= 5 ? 'text-danger' : 'text-secondary'
              }`}
              aria-live="polite"
            >
              {remainingSeconds}s
            </p>
          </div>

          <div
            className="mb-2 h-2.5 w-full rounded-full border-2 border-secondary bg-secondary/10 p-[2px] sm:mb-3 sm:h-3 lg:h-3.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label="Thời gian còn lại"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                remainingSeconds <= 5 ? 'bg-danger' : 'bg-accent'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <h2 className="font-display text-2xl font-bold leading-snug text-secondary sm:text-3xl md:text-[2rem] md:leading-tight lg:text-[2.25rem] xl:text-4xl">
            {card.title}
          </h2>
        </div>

        <p className="mt-3 min-h-0 flex-1 overflow-hidden text-base font-semibold leading-7 text-secondary/85 sm:mt-4 sm:text-lg sm:leading-8 lg:mt-5 lg:text-xl lg:leading-9">
          {card.description}
        </p>

        <div className="relative mt-4 grid shrink-0 grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 min-[360px]:gap-3 sm:mt-5 lg:mt-6 lg:gap-4">
          <button
            type="button"
            className={`${SWIPE_CHOICE_BASE} bg-secondary/10 text-secondary`}
            onClick={() => chooseDirection("left")}
          >
            <span className="block text-xs uppercase tracking-wide opacity-70">
              Vuốt trái
            </span>
            {card.leftChoice.label}
          </button>
          <button
            type="button"
            className={`${SWIPE_CHOICE_BASE} bg-primary text-white shadow-control`}
            onClick={() => chooseDirection("right")}
          >
            <span className="block text-xs uppercase tracking-wide opacity-80">
              Vuốt phải
            </span>
            {card.rightChoice.label}
          </button>
        </div>
        </motion.article>
      </div>
    </div>
  );
});
