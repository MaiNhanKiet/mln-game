import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const playerName = typeof body?.playerName === 'string' ? body.playerName.trim() : ''

    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
    }

    const player = await prisma.player.create({
      data: {
        playerName,
        capital: 5000,
        reputation: 50,
        laborPower: 70,
        scale: 1,
        status: 'PLAYING',
      },
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
