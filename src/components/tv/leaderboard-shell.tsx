'use client'

import dynamic from 'next/dynamic'

export const TvLeaderboard = dynamic(
  () => import('@/components/tv/Leaderboard').then((mod) => ({ default: mod.Leaderboard })),
  {
    ssr: false,
    loading: () => <div className="h-dvh w-full bg-background" suppressHydrationWarning />,
  },
)
