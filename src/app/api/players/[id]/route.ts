import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type UpdatePlayerBody = {
  capital?: number
  reputation?: number
  laborPower?: number
  scale?: number
  status?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdatePlayerBody
    const { capital, reputation, laborPower, scale, status } = body

    if (
      capital === undefined &&
      reputation === undefined &&
      laborPower === undefined &&
      scale === undefined &&
      status === undefined
    ) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(capital !== undefined && { capital }),
        ...(reputation !== undefined && { reputation }),
        ...(laborPower !== undefined && { laborPower }),
        ...(scale !== undefined && { scale }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    console.error('Error updating player:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
