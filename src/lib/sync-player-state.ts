import { createPlayer, getPlayerSnapshotFromState, syncPlayerToApi } from '@/lib/api/player'
import { useGameStore } from '@/stores/use-game-store'

export type PlayerSyncStatus = 'PLAYING' | 'VICTORY' | 'GAME_OVER'

export async function syncPlayerState(status: PlayerSyncStatus) {
  const current = useGameStore.getState()

  if (!current.gameRunId && !current.shopName) {
    return { ok: false as const, error: 'Missing player' }
  }

  const payload = {
    ...getPlayerSnapshotFromState(current),
    status,
  }

  const sync = async (playerId: string) => syncPlayerToApi(playerId, payload)

  let playerId = current.gameRunId
  let result = playerId
    ? await sync(playerId)
    : { ok: false as const, status: 404, error: 'Player not found' }

  if (!result.ok && result.status === 404 && current.shopName) {
    const created = await createPlayer(current.shopName)

    if (!created.ok) {
      console.warn('Không thể tạo lại người chơi:', created.error)
      return { ok: false as const, error: created.error }
    }

    playerId = created.data.id
    useGameStore.getState().setPlayerId(playerId)
    result = await sync(playerId)
  }

  if (!result.ok) {
    console.warn('Đồng bộ điểm thất bại:', result.error)
    return { ok: false as const, error: result.error }
  }

  return { ok: true as const, data: result.data }
}

export function getPlayerStatusFromPhase(phase: string): PlayerSyncStatus {
  if (phase === 'victory') {
    return 'VICTORY'
  }

  if (phase === 'gameOver') {
    return 'GAME_OVER'
  }

  return 'PLAYING'
}
