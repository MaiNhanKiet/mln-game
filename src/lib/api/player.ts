export type PlayerSyncPayload = {
  capital: number
  reputation: number
  laborPower: number
  scale: number
  status: 'PLAYING' | 'VICTORY' | 'GAME_OVER'
}

export type PlayerRecord = {
  id: string
  playerName: string
  capital: number
  reputation: number
  laborPower: number
  scale: number
  status: string
}

type ApiError = {
  ok: false
  status: number
  error: string
}

type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

export async function createPlayer(playerName: string): Promise<ApiResult<PlayerRecord>> {
  const res = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error ?? 'Không thể tạo người chơi' }
  }

  return { ok: true, data: data as PlayerRecord }
}

export async function syncPlayerToApi(
  playerId: string,
  payload: PlayerSyncPayload,
): Promise<ApiResult<PlayerRecord>> {
  const res = await fetch(`/api/players/${playerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error ?? 'Không thể đồng bộ điểm' }
  }

  return { ok: true, data: data as PlayerRecord }
}

export function getPlayerSnapshotFromState(state: {
  capital: number
  reputation: number
  staffMorale: number
  scale: number
}): Omit<PlayerSyncPayload, 'status'> {
  return {
    capital: state.capital,
    reputation: state.reputation,
    laborPower: state.staffMorale,
    scale: state.scale,
  }
}
