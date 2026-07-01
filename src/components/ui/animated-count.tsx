'use client'

import CountUp from 'react-countup'

type AnimatedCountProps = {
  value: number
  className?: string
  duration?: number
  suffix?: string
  separator?: string
}

export function AnimatedCount({
  value,
  className,
  duration = 0.55,
  suffix = '',
  separator = '.',
}: AnimatedCountProps) {
  return (
    <span className={className}>
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
