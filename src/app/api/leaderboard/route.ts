import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboardRanks, takeTopLeaderboardEntries } from '@/lib/leaderboard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const LEADERBOARD_SIZE = 10

const leaderboardWhere = {
  status: { in: ['PLAYING', 'VICTORY', 'GAME_OVER'] },
}

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId')
    const players = (await prisma.player.findMany({
      where: leaderboardWhere,
    })).map((player) => ({
      ...player,
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      topCapital: takeTopLeaderboardEntries(players, 'capital', LEADERBOARD_SIZE),
      topReputation: takeTopLeaderboardEntries(players, 'reputation', LEADERBOARD_SIZE),
      topLaborPower: takeTopLeaderboardEntries(players, 'laborPower', LEADERBOARD_SIZE),
      playerRanks: playerId ? getLeaderboardRanks(players, playerId) : null,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
