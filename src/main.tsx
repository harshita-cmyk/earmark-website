import { StrictMode, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import GradientText from './components/GradientText';
import ResearchStory from './components/ResearchStory';
import './styles.css';

const prototype = 'https://earmark-pi.vercel.app/';
const researchReadme = 'https://github.com/harshita-cmyk/earmark#readme';

function OutboundArrow() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResearchLink() {
  function followResearch(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const research = document.getElementById('research');
    if (research) {
      event.preventDefault();
      window.location.hash = research.id;
    }
  }

  return <a className="research-link" href={researchReadme} onClick={followResearch}>Explore the research</a>;
}

function GraphMotif() {
  const contour = 'M 14 156 C 80 156 99 116 160 116 S 253 146 309 113 S 378 39 442 39 S 527 100 602 100 S 678 76 730 105 S 780 176 831 176 S 912 153 962 113 S 1033 57 1084 57 S 1150 44 1186 14';

  return (
    <svg className="graph-motif" viewBox="0 0 1200 202" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="graph-ink" gradientUnits="userSpaceOnUse" x1="14" x2="1186">
          <stop offset="0" stopColor="#245de9" />
          <stop offset=".36" stopColor="#7935dc" />
          <stop offset=".55" stopColor="#bf32a5" />
          <stop offset=".71" stopColor="#08a5ba" />
          <stop offset="1" stopColor="#40a841" />
        </linearGradient>
        <mask id="graph-draw" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="202">
          <path className="graph-reveal" d={contour} pathLength="1" fill="none" stroke="white" strokeWidth="24" />
        </mask>
      </defs>
      <path d="M 14 156 V 201 M 442 39 V 201 M 831 176 V 201 M 1186 14 V 201 M 14 201 H 1186" className="graph-guides" />
      <path d={contour} className="graph-contour" mask="url(#graph-draw)" vectorEffect="non-scaling-stroke" />
      <g className="graph-points">
        <circle cx="14" cy="156" r="5.5" stroke="#245de9" />
        <circle cx="442" cy="39" r="5.5" stroke="#7935dc" />
        <circle cx="831" cy="176" r="5.5" stroke="#08a5ba" />
        <circle cx="1186" cy="14" r="5.5" stroke="#40a841" />
      </g>
    </svg>
  );
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header frame">
        <a className="brand" href="/" aria-current="page">
          <img src="/images/earmark-logo.webp" alt="Earmark home" width="130" height="36" />
        </a>
        <nav aria-label="Main">
          <a href={prototype}>Prototype <OutboundArrow /></a>
        </nav>
      </header>
      <main className="frame" id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-layout">
            <div>
              <p className="eyebrow">Earmark / Enabling Novel Data Interactions</p>
              <h1 id="hero-title">
                What does a graph <span className="headline-phrase"><GradientText colors={['#5925a9', '#9429cf', '#6432c3']}><em>sound</em></GradientText> like?</span>
              </h1>
            </div>
            <div className="hero-intro">
              <p>We've spent centuries learning to visualize graphs. Earmark asks what happens when we begin to listen.</p>
              <div className="hero-actions">
                <a className="primary-link" href={prototype}>
                  Explore Earmark <OutboundArrow />
                </a>
                <ResearchLink />
              </div>
            </div>
          </div>
          <GraphMotif />
        </section>
        <ResearchStory />
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
