import type { PlaybackPosition, PreambleItem, Sonification } from '../types'
import { createPianoSession, type PianoSession } from './piano'
import { positionAtTime } from '../graph/coordinates'
import { speak, type SpeechResult } from './speech'

export interface PlaybackOutcome {
  kind: 'completed' | 'cancelled' | 'failed'
  sessionId: number
  graphId: string
}
export interface PlaybackRequest {
  sessionId: number
  /** Scheduling is not evidence that the listener heard the graph. */
  scheduled: Promise<Omit<PlaybackOutcome, 'kind'> & { kind: 'scheduled' | 'cancelled' | 'failed' }>
  finished: Promise<PlaybackOutcome>
}

export type PlayerStatus = 'idle' | 'speaking' | 'loading' | 'playing' | 'paused' | 'completed' | 'error'
export interface PlayerSnapshot {
  status: PlayerStatus
  elapsedMs: number
  activeIndex: number
  error: string | null
  stoppedPosition: PlaybackPosition | null
  pauseSpeechFailed: boolean
}
interface Session {
  id: number
  graphId: string
  abort: AbortController
  piano?: PianoSession
  settle?: (kind: PlaybackOutcome['kind']) => void
}

/** Framework-independent coordinator; React subscribes to its immutable snapshot. */
export class PlaybackController {
  constructor(private readonly narrate: (text: string, signal: AbortSignal) => Promise<SpeechResult> = speak) {}
  private referenceAudio: AbortController | null = null
  private pausedGraphId: string | null = null
  private pauseSpeech: AbortController | null = null
  private generation = 0
  private session: Session | null = null
  private listeners = new Set<() => void>()
  private snapshot: PlayerSnapshot = { status: 'idle', elapsedMs: 0, activeIndex: -1, error: null, stoppedPosition: null, pauseSpeechFailed: false }
  getSnapshot = () => this.snapshot
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  private update(patch: Partial<PlayerSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach((listener) => listener())
  }
  private current(session: Session) {
    return this.session === session && session.id === this.generation && !session.abort.signal.aborted
  }
  private cancel(outcome: 'cancelled' | 'failed' = 'cancelled') {
    ++this.generation
    const previous = this.session
    this.session = null // invalidate callbacks before abort handlers run
    previous?.settle?.(outcome)
    previous?.abort.abort()
    previous?.piano?.dispose()
  }
  private cancelPauseSpeech() {
    const speech = this.pauseSpeech
    this.pauseSpeech = null
    speech?.abort()
  }
  stopReference = () => {
    this.referenceAudio?.abort()
    this.referenceAudio = null
  }
  playReference = async (notes: readonly string[]) => {
    if (!notes.length || ['loading', 'speaking', 'playing', 'paused'].includes(this.snapshot.status)) return 'cancelled'
    this.stopReference()
    const reference = new AbortController()
    this.referenceAudio = reference
    try {
      const piano = await createPianoSession(reference.signal)
      for (const [index, note] of notes.entries()) {
        await piano.playNote(note, 450, index === notes.length - 1 ? 1 : .12)
      }
      return 'completed'
    } catch {
      return reference.signal.aborted ? 'cancelled' : 'failed'
    } finally {
      reference.abort()
      if (this.referenceAudio === reference) this.referenceAudio = null
    }
  }
  reset = () => {
    this.stopReference()
    this.cancelPauseSpeech()
    this.cancel()
    this.pausedGraphId = null
    this.update({ status: 'idle', elapsedMs: 0, activeIndex: -1, error: null, stoppedPosition: null, pauseSpeechFailed: false })
  }
  private fail(session: Session) {
    if (!this.current(session)) return
    this.cancel('failed')
    this.update({ status: 'error', activeIndex: -1, error: 'Unable to load or play piano audio. Check your connection and press Play to retry.' })
  }
  pause = (describe: (position: PlaybackPosition) => string, speakPosition: boolean) => {
    const { status } = this.snapshot
    const session = this.session
    if (!session || (status !== 'playing' && status !== 'speaking')) return

    const position = session.piano?.getPosition() ?? null
    this.cancel()
    this.pausedGraphId = session.graphId
    const speech = position && speakPosition ? new AbortController() : null
    this.pauseSpeech = speech
    this.update({
      status: 'paused', stoppedPosition: position, elapsedMs: position?.elapsedMs ?? 0,
      activeIndex: position?.index ?? -1, pauseSpeechFailed: false,
    })
    if (speech && position && this.pauseSpeech === speech) {
      const settle = (failed: boolean) => {
        if (this.pauseSpeech !== speech) return
        this.pauseSpeech = null
        if (failed) this.update({ pauseSpeechFailed: true })
      }
      void this.narrate(describe(position), speech.signal).then(
        result => settle(result === 'failed'),
        () => settle(true),
      )
    }
  }
  resume = (s: Sonification) => {
    if (this.snapshot.status !== 'paused' || this.pausedGraphId !== s.graphId) return
    return this.play(s, undefined, this.snapshot.elapsedMs)
  }
  /** Each request settles exactly once, even if an underlying load never resolves. */
  play = (s: Sonification, preamble?: PreambleItem[], offsetMs = 0): PlaybackRequest => {
    this.reset()
    const session: Session = { id: this.generation, graphId: s.graphId, abort: new AbortController() }
    this.session = session
    const identity = { sessionId: session.id, graphId: s.graphId }
    let scheduled!: (value: Awaited<PlaybackRequest['scheduled']>) => void
    let finished!: (value: PlaybackOutcome) => void
    const request: PlaybackRequest = {
      sessionId: session.id,
      scheduled: new Promise((resolve) => { scheduled = resolve }),
      finished: new Promise((resolve) => { finished = resolve }),
    }
    session.settle = (kind) => {
      if (kind !== 'completed') scheduled({ ...identity, kind })
      finished({ ...identity, kind })
    }
    this.update({ status: 'loading', elapsedMs: offsetMs, activeIndex: offsetMs ? positionAtTime(s, offsetMs)?.index ?? -1 : -1 })
    void this.run(session, s, preamble, offsetMs, () => scheduled({ ...identity, kind: 'scheduled' }))
    return request
  }
  private async run(session: Session, s: Sonification, preamble: PreambleItem[] | undefined, offsetMs: number, scheduled: () => void) {
    const signal = session.abort.signal
    try {
      session.piano = await createPianoSession(signal)
      if (!this.current(session)) {
        session.piano.dispose()
        return
      }
      if (preamble) {
        this.update({ status: 'speaking' })
        for (const item of preamble) {
          signal.throwIfAborted()
          if ('say' in item) await this.narrate(item.say, signal)
          else await session.piano.playNote(item.name, item.ms)
          if (!this.current(session)) return
        }
      }
      const done = session.piano.playGraph(s, ({ index, elapsedMs }) => {
        if (this.current(session)) this.update({ activeIndex: index, elapsedMs })
      }, offsetMs)
      this.update({ status: 'playing' })
      scheduled()
      await done
      if (!this.current(session)) return
      session.piano.dispose()
      this.update({ status: 'completed', elapsedMs: s.durationMs, activeIndex: s.notes.length - 1 })
      session.settle?.('completed')
    } catch {
      this.fail(session)
    }
  }
}
