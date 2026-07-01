import type { Metadata } from 'next'
import { TvLeaderboard } from '@/components/tv/leaderboard-shell'

export const metadata: Metadata = {
  title: 'Bảng Vàng Tư Bản | Dashboard',
}

export default function TvLeaderboardPage() {
  return <TvLeaderboard />
}
