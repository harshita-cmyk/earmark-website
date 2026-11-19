import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { start } from 'tone';
import { getGraph } from '../prototype/data/graphs';
import { buildPreamble, midiToName, preambleText, sonify } from '../prototype/audio/sonification';
import { PlaybackController } from '../prototype/audio/player';
import { describeStop } from '../prototype/graph/descriptions';
import './PrototypeGuide.css';

const graph = getGraph('stock');
const sequence = sonify(graph);
const preamble = buildPreamble(sequence, graph);
const introduction = preamble.map(item => 'say' in item
    ? { say: item.say.replace(/^X axis:/, 'Horizontal axis.').replace(/^Y axis:/, 'Vertical axis.')
        .replace(/^Lowest:/, 'Lowest value.').replace(/^Highest:/, 'Highest value.')
        .replace(/^Starting:/, 'Starting value.').replace('1 dollars apart.', 'one dollar per semitone.').replace(/^Length:/, 'Playback lasts') }
    : item);
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const dollars = (value: number) => money.format(value);
const x = (day: number) => 65 + 28 * day;
const y = (value: number) => 274 - (value - 90) * 8;
const py = (midi: number) => 274 - (midi - 45) * 9;
const contour = graph.points.map(point => `${x(point.x)},${y(point.y)}`).join(' ');
const exactNotes = new Map(sequence.notes.map(note => [note.x, note]));
const lowPoint = graph.points.find(point => point.y === sequence.trough.value)!;
const highPoint = graph.points.find(point => point.y === sequence.peak.value)!;
const nextPitch = midiToName(sequence.trough.midi + sequence.stepSemitones);
const refs = [
  { label: 'Lowest', text: `${dollars(sequence.trough.value)} · ${sequence.trough.name}`, points: [lowPoint], notes: [sequence.trough.name] },
  { label: 'Highest', text: `${dollars(sequence.peak.value)} · ${sequence.peak.name}`, points: [highPoint], notes: [sequence.peak.name] },
  { label: 'Starting value', text: `${dollars(sequence.start.value)} · ${sequence.start.name}`, points: [graph.points[0]], notes: [sequence.start.name] },
  { label: 'Pitch step', text: `${dollars(sequence.unitsPerStep)} per semitone · ${sequence.trough.name} to ${nextPitch}`, points: [lowPoint], notes: [sequence.trough.name, nextPitch] },
  { label: 'Axes', text: `Trading day index ${graph.points[0].x}–${graph.points.at(-1)!.x} · Price in US dollars`, points: [], notes: [] },
];

function GuideFigure({ stage, reference, index }: { stage: number; reference: number; index: number | null }) {
  const id = useId();
  const noteMode = stage === 2 || stage === 4;
  const selected = index === null ? undefined : sequence.notes[index];
  return (
    <figure className="guide-figure" id={id} data-guide-stage={stage + 1}>
      <figcaption><strong>Share price, 20 trading days</strong><span>Illustrative dataset from the Earmark prototype</span></figcaption>
      <svg viewBox="0 0 650 328" role="img" aria-label={noteMode ? 'Timeline of piano pitches mapped from the illustrative stock graph' : 'Illustrative stock graph with 20 observations. It starts at 102 dollars, falls early, reaches 115 dollars, drops to 95 dollars, then recovers.'}>
        {(noteMode ? [48, 60, 72] : [90, 100, 110, 120]).map(level => {
          const yy = noteMode ? py(level) : y(level);
          const label = noteMode ? `C${level / 12 - 1}` : `$${level}`;
          return <g key={level}><path className="guide-grid" d={`M65 ${yy}H603`} /><text x="53" y={yy + 5} textAnchor="end">{label}</text></g>;
        })}
        <text x="65" y="19">{noteMode ? 'Piano pitch' : 'Price (USD)'}</text>
        <path d="M65 276H603" className="guide-axis" />
        {[0, 5, 10, 15, 19].map(day => <text key={day} x={x(day)} y="300" textAnchor="middle">{day}</text>)}
        <text x="333" y="322" textAnchor="middle">Trading day index</text>
        {!noteMode && <>
          <polyline points={contour} fill="none" className="guide-line" />
          {graph.points.map(p => <circle key={p.x} className="guide-point" cx={x(p.x)} cy={y(p.y)} r={stage === 0 ? 3 : 5} />)}
          {stage === 3 && refs[reference].points.map(p => <circle key={p.x} className="guide-reference" cx={x(p.x)} cy={y(p.y)} r="10" />)}
          {stage === 3 && reference === 3 && <path className="guide-reference guide-step-line" d={`M${x(lowPoint.x)} ${y(lowPoint.y)}V${y(lowPoint.y + sequence.unitsPerStep)}H603`} />}
          {stage === 3 && reference === 4 && <path className="guide-reference guide-step-line" d="M65 27V276H603" />}
        </>}
        {noteMode && sequence.notes.map(note => (
          <g key={note.index} className="guide-note">
            <circle cx={x(note.x)} cy={py(note.midi)} r={Number.isInteger(note.x) ? 4.8 : 3} />
            {Number.isInteger(note.x) && <path d={`M${x(note.x) + 4} ${py(note.midi)}v-14`} />}
          </g>
        ))}
        {noteMode && selected && <g className="guide-active" data-note={selected.index}>
          <path d={`M${x(selected.x)} 29V275`} />
          <circle cx={x(selected.x)} cy={py(selected.midi)} r="10" />
        </g>}
      </svg>
      {stage === 3 && <p className="guide-reference-caption">{refs[reference].label} · {refs[reference].text}</p>}
    </figure>
  );
}

export default function PrototypeGuide() {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [reference, setReference] = useState(0);
  const [scrollCue, setScrollCue] = useState<number | null>(null);
  const [scrollSound, setScrollSound] = useState(false);
  const scrollSoundRequested = useRef(false);
  const playedCues = useRef(new Set<number>());
  const cueRequest = useRef(0);
  const [cueError, setCueError] = useState('');
  const [controller] = useState(() => new PlaybackController());
  const player = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [withContext, setWithContext] = useState(true);
  const [announcePause, setAnnouncePause] = useState(true);
  const [hasVoice, setHasVoice] = useState(false);
  useEffect(() => {
    const speech = window.speechSynthesis;
    if (!speech) return;
    const update = () => setHasVoice(speech.getVoices().length > 0);
    update();
    speech.addEventListener('voiceschanged', update);
    return () => speech.removeEventListener('voiceschanged', update);
  }, []);

  const busy = player.status === 'loading' || player.status === 'speaking' || player.status === 'playing';

  const mainAudioOwnsPlayer = busy || player.status === 'paused';
  const stopCue = useCallback(() => {
    ++cueRequest.current;
    controller.stopReference();
  }, [controller]);

  const playCue = useCallback(async (cue: number) => {
    const request = ++cueRequest.current;
    const result = await controller.playReference(refs[cue].notes);
    if (request !== cueRequest.current || result === 'cancelled') return;
    setCueError(result === 'failed' ? 'Piano audio could not start. Use the Play buttons to try again.' : '');
    if (result === 'failed') {
      scrollSoundRequested.current = false;
      setScrollSound(false);
    }
  }, [controller]);

  useEffect(() => {
    if (!scrollSound || stage !== 3 || scrollCue === null || mainAudioOwnsPlayer) return;
    if (!refs[scrollCue].notes.length || playedCues.current.has(scrollCue)) return;
    const timer = window.setTimeout(() => {
      if (!scrollSoundRequested.current || playedCues.current.has(scrollCue)) return;
      playedCues.current.add(scrollCue);
      void playCue(scrollCue);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [scrollSound, stage, scrollCue, mainAudioOwnsPlayer, playCue]);

  async function toggleScrollSound(enabled: boolean) {
    scrollSoundRequested.current = enabled;
    setCueError('');
    if (!enabled) {
      setScrollSound(false);
      stopCue();
      return;
    }
    try {
      // Unlock on the checkbox gesture before any scroll-triggered playback.
      await start();
      if (!scrollSoundRequested.current) return;
      setScrollSound(true);
    } catch {
      if (!scrollSoundRequested.current) return;
      scrollSoundRequested.current = false;
      setScrollSound(false);
      setCueError('Scroll audio could not start. Use a Play button to hear a cue.');
    }
  }

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    if (location.hash === '#how-earmark-works') section.scrollIntoView();
    const steps = [...section.querySelectorAll('[data-guide-step]')];
    let frame = 0;
    let previousReference = -1;
    const update = () => {
      frame = 0;
      const line = innerHeight * (innerWidth < 832 ? .67 : .55);
      let active = 0;
      steps.forEach((step, i) => { if (step.getBoundingClientRect().top <= line) active = i; });
      if (section.getBoundingClientRect().bottom <= innerHeight + 1) active = steps.length - 1;
      setStage(active);
      if (active === 3) {
        let cue = 0;
        steps[3].querySelectorAll('li').forEach((item, i) => {
          if (item.getBoundingClientRect().top <= line) cue = i;
        });
        if (previousReference !== cue) {
          stopCue();
          setReference(cue);
          setScrollCue(cue);
        }
        previousReference = cue;
      } else if (previousReference !== -1) {
        stopCue();
        setScrollCue(null);
        previousReference = -1;
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    schedule();
    return () => {
      resize.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [stopCue]);

  useEffect(() => {
    const section = root.current;
    const beat = section?.querySelector('[data-guide-listening]');
    if (!section || !beat) return;
    const stop = () => {
      stopCue();
      controller.reset();
    };
    const onVisibility = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // The listening beat can move on layout changes. A paused announcement
        // belongs to the guide and only stops when the visitor leaves it.
        if (!entry.isIntersecting && (entry.target === section || ['loading', 'speaking', 'playing'].includes(controller.getSnapshot().status))) {
          stop();
        }
      }
    });
    observer.observe(section);
    observer.observe(beat);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stop);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', stop);
      stop();
    };
  }, [controller, stopCue]);


  function play() {
    stopCue();
    void controller.play(sequence, withContext ? hasVoice ? introduction : introduction.filter(item => 'note' in item) : undefined);
  }

  const canPause = player.status === 'playing' || player.status === 'speaking';

  function primaryAction() {
    if (canPause) {
      controller.pause(position => `At ${(position.elapsedMs / 1000).toFixed(2)} seconds. ${describeStop(graph, position)}`, announcePause && hasVoice);
    } else if (player.status === 'paused') {
      void controller.resume(sequence);
    } else if (busy) {
      controller.reset();
    } else {
      play();
    }
  }

  const stopped = player.stoppedPosition;
  const announceVisually = !announcePause || !hasVoice || player.pauseSpeechFailed;
  const index = player.activeIndex >= 0 ? player.activeIndex : stopped?.index ?? null;
  const current = index === null ? undefined : sequence.notes[index];
  const status = player.error ?? ({
    loading: 'Loading piano samples…', speaking: hasVoice ? 'Playing the spoken introduction and reference notes.' : 'Playing the reference notes.',
    playing: 'Playing the graph.', paused: 'Paused.', completed: 'Playback complete.',
    error: 'Audio could not play.', idle: 'Ready to listen.',
  }[player.status]);
  const primaryLabel = canPause ? 'Pause' : player.status === 'paused' ? 'Resume'
    : player.status === 'completed' ? 'Play again' : busy ? 'Cancel' : 'Play';
  const elapsed = Math.min(sequence.durationMs, player.elapsedMs);

  return (
    <section className="prototype-guide" id="how-earmark-works" ref={root} aria-labelledby="guide-title">
      <GuideFigure stage={busy || player.status === 'paused' ? 4 : stage} reference={reference} index={index} />
      <div className="guide-story">
        <div className="guide-step" data-guide-step>
          <h2 id="guide-title">What would make sound easier to understand?</h2>
          <p>Earmark explores how sound can communicate more than the direction of a graph. We’ll leave the COIN research chart behind and listen to what changes when we add context to an <strong>illustrative 20-day chart</strong> from the prototype.</p>
        </div>
        <div className="guide-step" data-guide-step>
          <h3>Start with the data.</h3>
          <p>Each point is one trading day’s share price. These are the values we’ll listen to.</p>
        </div>
        <div className="guide-step" data-guide-step>
          <h3>Now, give it a pitch.</h3>
          <p>Higher prices map to higher piano notes. The melody follows the same order as the trading days.</p>
        </div>
        <div className="guide-step" data-guide-step>
          <h3>But notes need meaning.</h3>
          <p>A few reference notes give the melody a scale and a starting point.</p>
          <label className="guide-cue-opt-in">
            <input type="checkbox" checked={scrollSound} onChange={event => void toggleScrollSound(event.target.checked)} />
            Enable sound as I scroll
          </label>
          <ul className="guide-references">
            {refs.map((item, i) => <li key={item.label}>
              <button type="button" onClick={() => { stopCue(); setReference(i); }} aria-pressed={reference === i}>
                <span>{item.label}</span><span>{item.text}</span>
              </button>
              {item.notes.length > 0 && <button type="button" className="guide-cue-play"
                disabled={mainAudioOwnsPlayer} aria-label={`Play ${item.label.toLowerCase()} reference`}
                onClick={() => { setReference(i); if (scrollSound) playedCues.current.add(i); void playCue(i); }}>
                Play
              </button>}
            </li>)}
          </ul>
          <p className="guide-cue-status" role="status">{cueError}</p>
        </div>
        <div className="guide-step guide-listen" data-guide-step data-guide-listening>
          <h3>Hear the difference.</h3>
          <p>Listen to the same graph with and without the introduction. What’s easier to place once you know the starting pitch and scale?</p>
          <div className="guide-transport">
            <button type="button" onClick={primaryAction}>{primaryLabel}</button>
            <button type="button" onClick={play} disabled={player.status === 'idle'}>Restart</button>
          </div>
          <div className="guide-options">
            <label><input type="checkbox" checked={withContext} onChange={event => setWithContext(event.target.checked)} /> Include the introduction and reference notes</label>
            {hasVoice && <label><input type="checkbox" checked={announcePause} onChange={event => setAnnouncePause(event.target.checked)} /> Speak position on pause</label>}
          </div>
          {!hasVoice && <p className="guide-position">This browser has no speech voice available. The introduction and positions are available as text.</p>}
          <p className="guide-status" role="status">{status}{stopped && announceVisually && ` At ${(elapsed / 1000).toFixed(2)} seconds. ${describeStop(graph, stopped)}`}</p>
          <div className="guide-progress">
            <progress aria-label="Piano playback progress" value={elapsed} max={sequence.durationMs} />
            <span>{(elapsed / 1000).toFixed(2)} / {sequence.durationMs / 1000} s</span>
          </div>
          {stopped && !announceVisually && <p className="guide-position">{describeStop(graph, stopped)}</p>}
          {current && !stopped && <p className="guide-position">Day index {current.x.toFixed(2)} · {dollars(current.value)} · {current.name}</p>}
          <details className="guide-data">
            <summary>Read the introduction and graph values</summary>
            <p>{preambleText(introduction)}</p>
            <table><caption>Original observations and mapped notes</caption>
              <thead><tr><th scope="col">Day index</th><th scope="col">Price (USD)</th><th scope="col">Pitch</th></tr></thead>
              <tbody>{graph.points.map(p => <tr key={p.x}><th scope="row">{p.x}</th><td>{dollars(p.y)}</td><td>{exactNotes.get(p.x)?.name}</td></tr>)}</tbody>
            </table>
          </details>
          <p className="guide-credit">Salamander Grand Piano by Alexander Holm · <a href="https://github.com/Tonejs/audio/tree/master/salamander">Tone.js samples</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></p>
        </div>
        <div className="guide-step" data-guide-step>
          <h3>Try another graph.</h3>
          <p><a className="guide-explore" href="https://earmark-pi.vercel.app/">Explore the prototype</a></p>
        </div>
      </div>
    </section>
  );
}
