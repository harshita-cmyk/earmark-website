import { useEffect, useId, useRef, useState } from 'react';
import GradientText from './GradientText';
import AppleAudioGraph from './AppleAudioGraph';
import './ResearchStory.css';

const chartNotes = [
  'From October to October.',
  'The same chart you’ll hear.',
  'Listen for the shape of the change.',
  'A direction you can hear. A distance you still have to judge.',
  'US dollars on the right. Time along the bottom.',
];

const cueNotes = {
  direction: 'From the first October toward February, the line generally falls.',
  magnitude: 'The early high and the February low are far apart on the chart. A falling pitch alone gives no dollar amount.',
  timing: 'The horizontal axis places the early fall between October and February.',
  turns: 'An early peak and a dip near February stand out. The line turns several more times later in the year.',
  reference: 'The dollar labels on the right are scale references for judging a value.',
  contrast: 'The line rises after the February dip. The size and timing of that rebound call for a scale and a timeline.',
  orientation: 'The original VoiceOver focus outline marks the left side of the chart, near the first October.',
  scale: 'The source chart marks $194, $251, $309, and $366 on its USD scale.',
  timeline: 'October, February, June, and the following October are the labeled time landmarks.',
  start: 'The first October marks the beginning. The screenshot shows the starting region and the reference scales.',
} as const;
type ChartCue = keyof typeof cueNotes;

const questions: { cue: ChartCue; text: string }[] = [
  { cue: 'direction', text: 'Which way did the price move?' },
  { cue: 'magnitude', text: 'How big was the drop?' },
  { cue: 'timing', text: 'When did it happen?' },
  { cue: 'turns', text: 'Where did you hear peaks and dips?' },
  { cue: 'reference', text: 'What would help you estimate a price?' },
];

const defaultCues: (ChartCue | undefined)[] = [undefined, undefined, 'direction', 'contrast', 'scale'];

function CoinOverlay({ cue }: { cue: ChartCue }) {
  const priceAxis = cue === 'reference' || cue === 'scale' || cue === 'timeline' || cue === 'start';
  const timeAxis = cue === 'timing' || cue === 'timeline' || cue === 'start';
  return (
    // These coordinates highlight regions of the original crop and never encode new observations.
    <svg className="coin-chart-overlay" viewBox="0 0 1132 650" aria-hidden="true" focusable="false">
      {cue === 'direction' && (
        <>
          <rect className="coin-region" x="10" y="17" width="328" height="568" rx="12" />
          <path className="coin-guide" d="M136 89 L288 401 M263 390 L288 401 L290 372" />
        </>
      )}
      {cue === 'magnitude' && (
        <>
          <circle cx="34" cy="49" r="29" />
          <circle cx="314" cy="566" r="34" />
          <path className="coin-guide" d="M367 53 H391 V566 H367" />
        </>
      )}
      {cue === 'turns' && (
        <>
          <circle cx="34" cy="49" r="29" />
          <circle cx="314" cy="566" r="34" />
          <circle cx="689" cy="562" r="34" />
        </>
      )}
      {cue === 'contrast' && (
        <>
          <rect className="coin-region" x="283" y="387" width="122" height="198" rx="12" />
          <path className="coin-guide" d="M327 529 L370 429 M347 443 L370 429 L371 453" />
        </>
      )}
      {priceAxis && <rect className="coin-price-cue" x="1022" y="24" width="91" height="508" rx="8" />}
      {timeAxis && <rect className="coin-time-cue" x="14" y="597" width={cue === 'timing' ? 390 : 1050} height="47" rx="7" />}
      {(cue === 'orientation' || cue === 'start') && (
        <rect className="coin-start-region" x="12" y="16" width="97" height="571" rx="9" />
      )}
    </svg>
  );
}

function CoinChart({ stage, cue, chartId }: {
  stage: number;
  cue?: ChartCue;
  chartId: string;
}) {
  return (
    <figure id={chartId} className="story-figure apple-stock-figure">
      <figcaption>
        <strong>COIN · One year</strong>
        <span>Apple Stocks · Research recording</span>
      </figcaption>
      <div className="coin-chart-image">
        <img
          src="/research/apple-stocks-coin.webp"
          width="1132"
          height="650"
          alt="Apple Stocks one-year chart for Coinbase Global (COIN). The share price in US dollars starts high in October, drops sharply around February, then fluctuates at lower levels through the following October."
        />
        <img
          className="coin-chart-brand"
          src="/research/earmark-coin.webp"
          width="1132"
          height="650"
          alt=""
        />
        {cue && <CoinOverlay key={cue} cue={cue} />}
      </div>
      <p className="coin-chart-note">{cue ? cueNotes[cue] : chartNotes[stage]}</p>
    </figure>
  );
}

export default function ResearchStory() {
  const titleId = useId();
  const section = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [scrollCue, setScrollCue] = useState<ChartCue>();
  const [chosenCue, setChosenCue] = useState<ChartCue>();
  const cue = stage === 2 && chosenCue ? chosenCue : scrollCue ?? defaultCues[stage];

  useEffect(() => {
    const root = section.current;
    const chart = root?.querySelector('.story-chart');
    const beats = root?.querySelectorAll('[data-story-beat]');
    if (!root || !chart || !beats?.length) return;
    const panel = root;
    const figure = chart;
    const storyBeats = beats;

    let frame = 0;
    let previousCue: ChartCue | undefined;
    function update() {
      frame = 0;
      if (!panel.getClientRects().length) return;
      const stacked = window.matchMedia('(max-width: 51.99rem)').matches;
      const chartBottom = figure.getBoundingClientRect().bottom;
      const readingLine = stacked
        ? Math.min(window.innerHeight * .7, Math.max(window.innerHeight * .5, chartBottom + 36))
        : window.innerHeight * .56;
      let current = 0;
      storyBeats.forEach((beat, index) => {
        if (beat.getBoundingClientRect().top <= readingLine) current = index;
      });
      let nextCue = defaultCues[current];
      if (current === 4) {
        // Give each context cue part of the remaining scroll, even on short viewports.
        const entered = Math.max(0, readingLine - storyBeats[current].getBoundingClientRect().top);
        const remaining = Math.max(0, panel.getBoundingClientRect().bottom - window.innerHeight);
        const progress = entered / Math.max(1, entered + remaining);
        nextCue = progress >= .67 ? 'start' : progress >= .34 ? 'timeline' : 'scale';
      } else {
        storyBeats[current].querySelectorAll<HTMLElement>('[data-chart-cue]').forEach(element => {
          if (element.getBoundingClientRect().top <= readingLine) {
            nextCue = element.dataset.chartCue as ChartCue;
          }
        });
      }
      if (previousCue !== nextCue) {
        previousCue = nextCue;
        setChosenCue(undefined);
      }
      setStage(current);
      setScrollCue(nextCue);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(schedule);
    resize.observe(panel);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={section} id="research" tabIndex={-1} className="research-story research-living" aria-labelledby={titleId}>
      <div className="story-chart" data-stage={stage + 1} data-cue={cue}>
        <CoinChart stage={stage} cue={cue} chartId={`${titleId}-chart`} />
      </div>
      <div className="story-beats">
        <div className="story-beat" data-story-beat>
          <h2 id={titleId}>A graph tells a story.</h2>
          <p>This is a year of Coinbase Global’s stock price in Apple Stocks, the chart we used in our research. Follow it from October to October. The price starts high, falls sharply around February, then fluctuates at lower levels.</p>
        </div>

        <div className="story-beat" data-story-beat>
          <h3>Now, imagine listening.</h3>
          <p>VoiceOver translates graph values into changing tones. Higher values produce higher pitches, allowing listeners to hear changes over time.</p>
          <AppleAudioGraph />
        </div>

        <div className="story-beat" data-story-beat>
          <h3>But how much did it change?</h3>
          <p>Think about the sharp drop. How much could you tell from the sound alone?</p>
          <ul className="story-questions">
            {questions.map(question => (
              <li key={question.cue} data-chart-cue={question.cue}>
                <button
                  type="button"
                  aria-pressed={stage === 2 && cue === question.cue}
                  aria-controls={`${titleId}-chart`}
                  onClick={() => setChosenCue(question.cue)}
                >{question.text}</button>
              </li>
            ))}
          </ul>
          <span className="story-visually-hidden" role="status">{chosenCue ? cueNotes[chosenCue] : ''}</span>
        </div>

        <div className="story-beat" data-story-beat>
          <h3>Hearing change is not the same as understanding it.</h3>
          <div className="story-evidence" data-chart-cue="contrast">
            <h4>Sighted novice listeners</h4>
            <p>Listeners often heard whether a trend went up or down. Judging how much it changed and remembering earlier notes were harder.</p>
          </div>
          <div className="story-evidence" data-chart-cue="orientation">
            <h4>Blind and low-vision interview</h4>
            <p>The interview offered a different perspective. Knowing the starting value, having reference points, and being able to revisit part of the graph can help listeners orient themselves and compare what they heard.</p>
          </div>
        </div>

        <div className="story-beat" data-story-beat>
          <h3>Sound needs <GradientText colors={['#5925a9', '#9429cf']}>context</GradientText>.</h3>
          <p>The dollar scale gives you reference points. A starting value and time landmarks help you stay oriented.</p>
          <p>Now imagine being able to pause, revisit a moment, and inspect its value.</p>
        </div>
      </div>
    </section>
  );
}
