export type SpeechResult = 'completed' | 'cancelled' | 'failed'

interface Narration {
  utterance: SpeechSynthesisUtterance
  cancel: () => void
}

// Retain the utterance until the engine reports completion or its owner cancels it.
let active: Narration | null = null

export function speak(text: string, signal?: AbortSignal): Promise<SpeechResult> {
  if (signal?.aborted) return Promise.resolve('cancelled')
  if (typeof speechSynthesis === 'undefined') return Promise.resolve('failed')
  active?.cancel()
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    const english = speechSynthesis.getVoices().filter(voice => /^en[-_]/i.test(voice.lang))
    const voice = english.find(voice => voice.default)
      ?? english.find(voice => voice.localService && /^en[-_]US$/i.test(voice.lang))
      ?? english.find(voice => voice.localService)
    if (voice) utterance.voice = voice
    utterance.rate = .95

    const finish = (result: SpeechResult) => {
      if (active !== narration) return false
      active = null
      signal?.removeEventListener('abort', narration.cancel)
      narration.utterance.onend = null
      narration.utterance.onerror = null
      resolve(result)
      return true
    }
    const narration = {
      utterance,
      cancel: () => {
        // Retire this owner before native cancellation can emit an error event.
        if (finish('cancelled')) speechSynthesis.cancel()
      },
    }
    active = narration
    signal?.addEventListener('abort', narration.cancel, { once: true })
    utterance.onend = () => { finish('completed') }
    utterance.onerror = () => { finish('failed') }
    try {
      if (speechSynthesis.paused) speechSynthesis.resume()
      speechSynthesis.speak(utterance)
    } catch {
      finish('failed')
    }
  })
}
