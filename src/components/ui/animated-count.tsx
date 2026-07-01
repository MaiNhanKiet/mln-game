'use client'

import type { CSSProperties } from 'react'
import CountUp from 'react-countup'

type AnimatedCountProps = {
  value: number
  className?: string
  style?: CSSProperties
  duration?: number
  suffix?: string
  separator?: string
}

export function AnimatedCount({
  value,
  className,
  style,
  duration = 0.55,
  suffix = '',
  separator = '.',
}: AnimatedCountProps) {
  return (
    <span className={className} style={style}>
      <CountUp
        end={value}
        duration={duration}
        preserveValue
        separator={separator}
        decimals={0}
        useEasing
      />
      {suffix}
    </span>
  )
}
