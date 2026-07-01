export type MediaElementAudioGraph = {
  audio: HTMLAudioElement
  context: AudioContext
  source: MediaElementAudioSourceNode
  gain: GainNode
}

let sharedAudioContext: AudioContext | null = null

export function clampAudioVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 1
  }

  return Math.min(1, Math.max(0, volume))
}

export function getAudioContext() {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in the browser')
  }

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      throw new Error('Web Audio API is not supported')
    }

    sharedAudioContext = new AudioContextCtor()
  }

  return sharedAudioContext
}

export async function resumeAudioContext() {
  const context = getAudioContext()

  if (context.state === 'suspended') {
    await context.resume()
  }
}

export function createMediaElementAudioGraph(
  src: string,
  options?: { loop?: boolean; initialVolume?: number },
): MediaElementAudioGraph {
  const context = getAudioContext()
  const audio = new Audio(src)

  audio.loop = options?.loop ?? false
  audio.preload = 'auto'
  audio.volume = 1

  const source = context.createMediaElementSource(audio)
  const gain = context.createGain()
  gain.gain.value = clampAudioVolume(options?.initialVolume ?? 1)

  source.connect(gain)
  gain.connect(context.destination)

  return { audio, context, source, gain }
}

export function setMediaGain(gain: GainNode, volume: number) {
  gain.gain.value = clampAudioVolume(volume)
}

export function fadeMediaGainTo(
  graph: MediaElementAudioGraph,
  targetVolume: number,
  durationMs = 700,
  onComplete?: () => void,
) {
  const safeTarget = clampAudioVolume(targetVolume)
  const now = graph.context.currentTime
  const durationSec = durationMs / 1000

  graph.gain.gain.cancelScheduledValues(now)
  graph.gain.gain.setValueAtTime(graph.gain.gain.value, now)
  graph.gain.gain.linearRampToValueAtTime(safeTarget, now + durationSec)

  if (!onComplete) {
    return
  }

  window.setTimeout(onComplete, durationMs)
}

export async function playMediaAudio(graph: MediaElementAudioGraph) {
  await resumeAudioContext()

  if (graph.audio.paused) {
    await graph.audio.play().catch(() => undefined)
  }
}

export async function unlockMediaAudio(graph: MediaElementAudioGraph) {
  await resumeAudioContext()

  await graph.audio.play().then(() => {
    graph.audio.pause()
    graph.audio.currentTime = 0
  }).catch(() => undefined)
}

export function destroyMediaElementAudioGraph(graph: MediaElementAudioGraph) {
  graph.audio.pause()
  graph.source.disconnect()
  graph.gain.disconnect()
}
