const getOutcomeLabel = (status: string) => {
  if (status === 'VICTORY') {
    return 'VICTORY'
  }

  if (status === 'GAME_OVER') {
    return 'GAME OVER'
  }

  return 'PLAYING'
}

type OutcomeTagProps = {
  status: string
  compact?: boolean
  tvScaled?: boolean
}

export function OutcomeTag({ status, tvScaled = false }: OutcomeTagProps) {
  const isVictory = status === 'VICTORY'
  const isGameOver = status === 'GAME_OVER'

  return (
    <span
      style={
        tvScaled
          ? {
              height: 'calc(1.5rem * var(--tv-lb-scale, 1))',
              fontSize: 'calc(10px * var(--tv-lb-scale, 1))',
            }
          : undefined
      }
      className={`box-border flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-pill border-2 text-center font-extrabold uppercase leading-none tracking-wide ${
        tvScaled ? 'px-1.5 sm:px-2' : 'h-6 w-full px-1.5 text-[9px] sm:px-2 sm:text-[10px] lg:h-7 lg:text-[11px]'
      } ${
        isVictory
          ? 'border-[#D4AF37]/50 bg-[#FFF4B8] text-secondary'
          : isGameOver
            ? 'border-danger bg-danger text-white'
            : 'border-secondary/20 bg-secondary/10 text-secondary/70'
      }`}
    >
      {getOutcomeLabel(status)}
    </span>
  )
}
