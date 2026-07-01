import { BadgeCheck, Coins, Store, Users } from 'lucide-react'

type ScoreTone = 'capital' | 'reputation' | 'labor' | 'scale'

type ScoreBarProps = {
  label: string
  value: number
  maxValue: number
  displayValue: string
  tone: ScoreTone
  helperText: string
  helperTone?: 'default' | 'success'
  delta?: number
}

const toneClassNames: Record<
  ScoreTone,
  {
    fill: string
    text: string
    track: string
    iconBg: string
    iconShadow: string
    Icon: typeof Coins
  }
> = {
  capital: {
    fill: 'bg-capital',
    text: 'text-capital',
    track: 'bg-capital/15',
    iconBg: 'bg-capital/25',
    iconShadow: 'shadow-[2px_2px_0_0_rgba(212,163,115,1)]',
    Icon: Coins,
  },
  reputation: {
    fill: 'bg-reputation',
    text: 'text-reputation',
    track: 'bg-reputation/15',
    iconBg: 'bg-reputation/25',
    iconShadow: 'shadow-[2px_2px_0_0_rgba(194,139,139,1)]',
    Icon: BadgeCheck,
  },
  labor: {
    fill: 'bg-labor',
    text: 'text-labor',
    track: 'bg-labor/15',
    iconBg: 'bg-labor/25',
    iconShadow: 'shadow-[2px_2px_0_0_rgba(130,147,119,1)]',
    Icon: Users,
  },
  scale: {
    fill: 'bg-secondary',
    text: 'text-secondary',
    track: 'bg-secondary/15',
    iconBg: 'bg-secondary/15',
    iconShadow: 'shadow-[2px_2px_0_0_rgba(66,54,46,1)]',
    Icon: Store,
  },
}

export function ScoreBar({
  label,
  value,
  maxValue,
  displayValue,
  tone,
  helperText,
  helperTone = 'default',
  delta,
}: ScoreBarProps) {
  const safeMaxValue = Math.max(1, maxValue)
  const safeValue = Math.min(safeMaxValue, Math.max(0, value))
  const percentage = Math.round((safeValue / safeMaxValue) * 100)
  const classes = toneClassNames[tone]
  const hasDelta = delta !== undefined && delta !== 0
  const Icon = classes.Icon

  return (
    <article className="relative flex h-full min-h-[4.9rem] flex-col overflow-hidden rounded-xl border-2 border-secondary bg-white p-1.5 shadow-[3px_3px_0_0_#42362E] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#42362E] min-[390px]:min-h-[5.35rem] min-[390px]:p-2 min-[720px]:min-h-[7rem] min-[720px]:rounded-2xl min-[720px]:p-2.5">
      <div className={`absolute -right-3 -top-3 h-11 w-11 rounded-full min-[720px]:h-14 min-[720px]:w-14 ${classes.track}`} />

      {hasDelta ? (
        <span
          key={`${label}-${delta}-${value}`}
          className={`absolute right-1.5 top-1.5 z-10 rounded-full border-2 border-secondary bg-white px-1.5 py-0.5 text-[8px] font-black leading-none shadow-[2px_2px_0_0_#42362E] min-[720px]:right-2 min-[720px]:top-2 min-[720px]:text-[10px] ${
            delta > 0 ? 'animate-rise-pop text-success' : 'animate-drop-pop text-danger'
          }`}
        >
          {delta > 0 ? '+' : ''}
          {delta.toLocaleString('vi-VN')}
        </span>
      ) : null}

      <div className="relative grid grid-cols-[1.65rem_minmax(0,1fr)] items-start gap-1 min-[390px]:grid-cols-[1.75rem_minmax(0,1fr)] min-[390px]:gap-1.5 min-[720px]:grid-cols-[2rem_minmax(0,1fr)] min-[720px]:gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 border-secondary min-[390px]:h-7 min-[390px]:w-7 min-[720px]:h-8 min-[720px]:w-8 min-[720px]:rounded-xl ${classes.iconBg} ${classes.iconShadow}`}
          aria-hidden="true"
        >
          <Icon className={classes.text} size={13} strokeWidth={2.8} />
        </div>

        <div className="min-w-0">
          <p className="whitespace-normal break-words text-[7.5px] font-black uppercase leading-[1.05] tracking-wide text-secondary/65 min-[390px]:text-[8.5px] min-[720px]:text-[9.5px]">
            {label}
          </p>
          <p className={`mt-0.5 whitespace-nowrap font-display text-[0.92rem] font-black leading-none tabular-nums min-[390px]:text-[1.08rem] min-[720px]:text-[1.22rem] ${classes.text}`}>
            {displayValue}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-1 min-[390px]:pt-1.5 min-[720px]:pt-2">
        <div className="h-3 w-full overflow-hidden rounded-full border-2 border-secondary bg-slate-100 p-[2px] min-[390px]:h-3.5 min-[720px]:h-4">
          <div
            className={`h-full min-w-[2px] rounded-full ${classes.fill} transition-all duration-slow`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-0.5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1 text-[7.5px] font-bold text-secondary/65 min-[390px]:mt-1 min-[390px]:text-[9px] min-[720px]:mt-1.5 min-[720px]:gap-1.5 min-[720px]:text-[10px]">
          <span
            className={`min-w-0 truncate leading-[1.15] ${
              helperTone === 'success' ? 'text-success' : ''
            }`}
          >
            {helperText}
          </span>
          <span className="shrink-0 whitespace-nowrap font-black text-secondary">{percentage}%</span>
        </div>
      </div>
    </article>
  )
}
