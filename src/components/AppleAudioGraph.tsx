import { useEffect, useId, useRef, useState } from 'react';
import waveform from './appleAudioWaveform.json';
import './AppleAudioGraph.css';

const source = '/research/apple-stocks-voiceover.m4a';
const waveformPath = waveform.map((peak, index) => {
  const half = Math.max(1, peak * 15);
  return `M${index * 4 + 2} ${17 - half}v${2 * half}`;
}).join(' ');

const messages = {
  ready: 'Ready to play',
  loading: 'Loading audio…',
  playing: 'Playing',
  paused: 'Paused',
  ended: 'Playback complete',
  error: 'Audio couldn’t play. Try again.',
};

export default function AppleAudioGraph() {
  const id = useId();
  const audio = useRef<HTMLAudioElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const [state, setState] = useState<keyof typeof messages>('ready');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const media = audio.current;
    const beat = player.current?.closest('[data-story-beat]');
    if (!media || !beat) return;

    function pause() {
      request.current += 1;
      media?.pause();
    }

    function visibilityChanged() {
      if (document.hidden) pause();
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pause();
    });
    observer.observe(beat);
    window.addEventListener('pagehide', pause);
    document.addEventListener('visibilitychange', visibilityChanged);

    return () => {
      observer.disconnect();
      window.removeEventListener('pagehide', pause);
      document.removeEventListener('visibilitychange', visibilityChanged);
      pause();
    };
  }, []);

  async function play(restart = false) {
    const media = audio.current;
    if (!media) return;

    const current = ++request.current;
    if (media.error) media.load();
    if (restart || media.ended) {
      media.currentTime = 0;
      setProgress(0);
    }
    setState('loading');

    try {
      await media.play();
    } catch {
      if (request.current === current) setState('error');
    }
  }

  function toggle() {
    const media = audio.current;
    if (!media) return;
    if (!media.paused) {
      request.current += 1;
      media.pause();
      setState('paused');
    } else {
      void play();
    }
  }

  const active = state === 'playing' || state === 'loading';
  const label = active ? 'Pause' : state === 'ended' ? 'Replay Apple’s audio graph' : 'Hear Apple’s audio graph';

  return (
    <div className="apple-audio" ref={player} role="group" aria-labelledby={`${id}-label`}>
      <p className="apple-audio-label" id={`${id}-label`}>Apple Stocks · VoiceOver audio graph</p>
      <p className="apple-audio-description" id={`${id}-description`}>
        In this excerpt, the pitch starts high, drops steeply, then varies at a lower pitch. You’re hearing the VoiceOver audio graph for the one-year COIN chart shown here.
      </p>
      <audio
        ref={audio}
        src={source}
        preload="none"
        onPlaying={() => setState('playing')}
        onWaiting={() => setState('loading')}
        onPause={event => {
          if (!event.currentTarget.ended) setState('paused');
        }}
        onEnded={() => setState('ended')}
        onError={() => setState('error')}
        onTimeUpdate={event => {
          const { currentTime, duration } = event.currentTarget;
          setProgress(duration > 0 && Number.isFinite(duration) ? currentTime / duration : 0);
        }}
      />
      <svg className="apple-audio-wave" viewBox="0 0 320 34" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><clipPath id={`${id}-elapsed`}><rect width={320 * progress} height="34" /></clipPath></defs>
        <path d={waveformPath} />
        <path className="apple-audio-elapsed" d={waveformPath} clipPath={`url(#${id}-elapsed)`} />
      </svg>
      <div className="apple-audio-controls">
        <button type="button" className="apple-audio-play" onClick={toggle} aria-describedby={`${id}-description`}>{label}</button>
        <button type="button" className="apple-audio-restart" onClick={() => void play(true)}>Restart</button>
      </div>
      <p className="apple-audio-state" role="status">{messages[state]}</p>
    </div>
  );
}
