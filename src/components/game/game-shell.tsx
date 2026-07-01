'use client'

import dynamic from 'next/dynamic'

export const GamePrototype = dynamic(
  () => import('@/components/game/GamePrototype').then((mod) => ({ default: mod.GamePrototype })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-dvh items-center justify-center bg-[#F8F5E9]"
        suppressHydrationWarning
      />
    ),
  },
)
