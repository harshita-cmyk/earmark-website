import * as Tone from 'tone'
import type { PlaybackPosition, Sonification } from '../types'
import { nameToMidi } from './sonification'
import { positionAtTime } from '../graph/coordinates'
import { abortable } from './cancellation'

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'
const SAMPLE_NAMES = ['A0', 'C8', ...Array.from({ length: 7 }, (_, i) =>
  ['C', 'D#', 'F#', 'A'].map((note) => `${note}${i + 1}`)).flat()]
// Only decoded, immutable sample data is shared. Voices and output nodes never are.
const sampleCache = new Map<string, AudioBuffer>()

async function loadSamples(signal: AbortSignal): Promise<Map<number, AudioBuffer>> {
  return new Map(await Promise.all(SAMPLE_NAMES.map(async (name) => {
    let buffer = sampleCache.get(name)
    if (!buffer) {
      const response = await fetch(`${SAMPLE_BASE_URL}${name.replace('#', 's')}.mp3`, { signal })
      if (!response.ok) throw new Error(`Piano sample request failed (${response.status})`)
      buffer = await abortable(Tone.getContext().decodeAudioData(await response.arrayBuffer()), signal)
      signal.throwIfAborted()
      sampleCache.set(name, buffer)
    }
    return [nameToMidi(name), buffer] as const
  })))
}

export interface PianoSession {
  playNote: (name: string, ms: number, releaseSeconds?: number) => Promise<void>
  playGraph: (s: Sonification, onPosition: (position: PlaybackPosition) => void, offsetMs?: number) => Promise<void>
  dispose: () => void
  getPosition: () => PlaybackPosition | null
}

/** One request owns every voice, timer and output node, including its preamble. */
export async function createPianoSession(signal: AbortSignal): Promise<PianoSession> {
  signal.throwIfAborted()
  // Invoke start synchronously in the initiating user gesture, before narration.
  const loading = new AbortController()
  const loadingSignal = AbortSignal.any([signal, loading.signal])
  const timeout = setTimeout(() => loading.abort(new Error('Piano loading timed out')), 30_000)
  let samples: Map<number, AudioBuffer>
  try {
    await abortable(Tone.start(), loadingSignal)
    samples = await loadSamples(loadingSignal)
  } catch (error) {
    loading.abort() // cancel sibling sample requests on the first failure
    throw error
  } finally {
    clearTimeout(timeout)
  }
  signal.throwIfAborted()
  const output = new Tone.Gain(1).toDestination()
  const voices = new Set<{ source: AudioBufferSourceNode; envelope: Tone.Gain }>()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let disposed = false
  let graphTimeline: { s: Sonification; t0: number; offsetMs: number } | null = null
  const getPosition = () => disposed || !graphTimeline ? null
    : positionAtTime(graphTimeline.s, Math.max(graphTimeline.offsetMs, (Tone.immediate() - graphTimeline.t0) * 1000))

  const dispose = () => {
    if (disposed) return
    disposed = true
    signal.removeEventListener('abort', dispose)
    timers.forEach(clearTimeout)
    timers.clear()
    // A hard output disconnect silences active AND future sources immediately.
    // Do not depend on Sampler.releaseAll(): scheduled releases lose its handles.
    output.gain.cancelScheduledValues(0)
    output.gain.setValueAtTime(0, Tone.immediate())
    output.disconnect()
    for (const { source, envelope } of voices) {
      source.onended = null
      source.stop() // native stop also cancels a source whose start is in the future
      source.disconnect()
      envelope.dispose()
    }
    voices.clear()
    output.dispose()
  }
  signal.addEventListener('abort', dispose, { once: true })

  const at = (ms: number, callback: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      if (!disposed && !signal.aborted) callback()
    }, ms)
    timers.add(timer)
  }
  const wait = (ms: number) => abortable(new Promise<void>((resolve) => at(ms, resolve)), signal)
  const note = (name: string, ms: number, time: number, offset = 0, releaseSeconds = 1): Promise<void> => {
    signal.throwIfAborted()
    if (disposed) throw new Error('Piano session has ended')
    const midi = nameToMidi(name)
    // Match Tone.Sampler's nearest-sample choice (prefer the higher sample on ties).
    const closest = [...samples.keys()].sort((a, b) => Math.abs(a - midi) - Math.abs(b - midi) || b - a)[0]
    const buffer = samples.get(closest)!
    const rate = 2 ** ((midi - closest) / 12)
    // Keep native source handles: unlike Sampler, scheduled releases cannot
    // remove them from our ownership. Tone still supplies routing and envelopes.
    const releaseAt = ms / 1000
    if (offset >= releaseAt + releaseSeconds || offset * rate >= buffer.duration) return Promise.resolve()
    const source = Tone.getContext().createBufferSource()
    const envelope = new Tone.Gain(0).connect(output)
    source.buffer = buffer
    source.playbackRate.value = rate
    Tone.connect(source, envelope)
    const voice = { source, envelope }
    voices.add(voice)
    const ended = new Promise<void>((resolve) => {
      source.onended = () => {
        voices.delete(voice)
        source.disconnect()
        envelope.dispose()
        resolve()
      }
    })
    // Rejoin an interrupted sample at its original phase, without another attack.
    const releaseElapsed = Math.max(0, offset - releaseAt)
    if (!releaseElapsed) {
      envelope.gain.setValueAtTime(1, time)
      envelope.gain.targetRampTo(0, releaseSeconds, time + releaseAt - offset)
    } else {
      const constant = Math.log(2) / Math.log(200)
      const gainAtRamp = Math.exp(-.9 / constant)
      const gain = releaseElapsed < .9
        ? Math.exp(-releaseElapsed / constant)
        : gainAtRamp * (1 - releaseElapsed) / .1
      envelope.gain.setValueAtTime(gain, time)
      if (releaseElapsed < .9) {
        envelope.gain.setTargetAtTime(0, time, constant)
        envelope.gain.cancelAndHoldAtTime(time + .9 - releaseElapsed)
      }
      envelope.gain.linearRampToValueAtTime(0, time + 1 - releaseElapsed)
    }
    source.start(time, offset * rate)
    source.stop(time + releaseAt + releaseSeconds - offset)
    return ended
  }

  return {
    dispose,
    getPosition,
    async playNote(name, ms, releaseSeconds) {
      const ended = note(name, ms, Tone.now() + 0.02, 0, releaseSeconds)
      if (releaseSeconds !== undefined) await abortable(ended, signal)
      else await wait(ms + 60)
    },
    playGraph(s, onPosition, offsetMs = 0) {
      const start = Tone.now() + 0.05
      const t0 = start - offsetMs / 1000
      graphTimeline = { s, t0, offsetMs }
      const ended = s.notes.map(n => note(
        n.name, n.durationMs, Math.max(start, t0 + n.startMs / 1000),
        Math.max(0, offsetMs - n.startMs) / 1000,
      ))
      const timelineEnd = new Promise<void>((resolve) => {
        const tick = () => {
          const position = getPosition()
          if (position) onPosition(position)
          if (position && position.elapsedMs >= s.durationMs) resolve()
          else at(25, tick)
        }
        tick()
      })
      return abortable(Promise.all([timelineEnd, ...ended]), signal).then(() => dispose())
    },
  }
}
