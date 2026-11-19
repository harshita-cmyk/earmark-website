# Earmark implementation plan

Use [PRODUCT.md](PRODUCT.md) for scope and claims and [DESIGN.md](DESIGN.md) for the selected direction and interaction contract.

## 1. Confirm source material

- Add the supplied production wordmark under `public/images/` when it arrives. Check its native dimensions, whitespace, sharpness at header size, and accessible naming.
- Verify the live prototype URL from the README and check the destinations for Tutorial, Test, and Playground before linking to them. Confirm public team credits and any materials that support the research notes.
- Confirm a static deployment target and a framework suited to a single page with one interactive figure. Start with static HTML and progressive enhancement as the architecture, with a small client module for the example.
- Choose a piano recording or sample with confirmed redistribution rights. Record its attribution and the simplified demo’s mapping before writing any claim about fidelity.

**Ready when:** The team can identify the official logo, prototype destinations, audio provenance, and sources for each public research claim.

## 2. Build the editorial page

- Create the header and anchor navigation, opening question, figure, method, research notes, and prototype links. Build the semantic document in mobile reading order, then add the wider grid.
- Implement the palette, type scale, visible focus treatment, and spacing from DESIGN.md. Keep the study context, trend summary, mapping explanation, and exact values available in HTML before scripts run.
- Use one figure for the opening and the interactive example. The hero link lands on its heading. The prototype link has a distinct destination and label.
- Check early layouts at 320, 390, 768, and 1440 CSS px. Adjust the grid where the longest real heading or the plot becomes crowded.

**Ready when:** With scripting and audio unavailable, a visitor can read the mission, describe the trend, find a value, and reach the prototype link.

## 3. Build the example around one data source

- Start with an illustrative five-point series, such as values 2, 5, 7, 3, 6 at steps 1–5. Label the values as unitless. The proposed caption is “The value rises from 2 to a peak of 7, drops to 3, then recovers to 6.” Verify the plot, caption, and table against the chosen series.
- Define a fixed pitch mapping for the example and document it beside the figure. Keep sample positions, values, note names, and cue times in one source so the plot, table, readout, and sound agree. If the example uses five discrete notes, describe it as a simplified example of the prototype’s denser sequence.
- For one fixed example, start with a small prerendered piano clip and an accessible HTML audio element controlled by native buttons. Use cue times and the audio clock to synchronize the visual position. Lazy-load the clip and handle loading, playback rejection, rapid repeated presses, pause, restart, and completion. Keep a single active playback instance.
- Follow the motion and announcement rules in DESIGN.md. Keep the value disclosure usable whether the audio is idle, playing, paused, or unavailable.

**Ready when:** The chart, caption, point navigation, table, and piano all represent the same series. A visitor can recover from a failed play attempt or finish the example without audio.

## 4. Review the finished experience

- Use Playwright MCP to capture the desktop and mobile composition and inspect the page’s accessibility snapshot and tab order. Exercise the hero jump, data disclosure, keyboard playback controls, point navigation, completion, and replay. Emulate reduced motion and forced colors. Simulate an audio load failure and check that the text path remains intact.
- Manually test the full workflow with Safari and VoiceOver and with NVDA on Windows where available. Check that the chart has a useful description, the table reads naturally, playback announcements leave room for assistive speech, and focus stays predictable. Test touch controls and audible playback on at least one mobile browser.
- Review text and non-text contrast, 200% text resize, 320 CSS px reflow, text spacing, and keyboard focus. Record which checks were run and any failures. If blind or low-vision collaborators are available, invite feedback on the clarity of the example and its controls.
- Compare screenshots against the selected direction. The opening question should read first, the chart should reward attention next, and playback should feel like part of the figure. Check that the gradient leaves axis labels and observations unambiguous.
- Verify the outbound links from the release preview and proofread credits, terminology, and evidence claims.

**Ready when:** The core journey works with keyboard, touch, and assistive technology, and every data insight can be reached without sound. Report accessibility against the scope actually tested.

## Section 2 research example

- Keep the one-year COIN chart from the Apple Stocks recording in view through all five beats. The frame shows the time labels and the USD axis. Treat its tick marks as scale references. Exact sampled prices and timestamp-to-audio mappings are not available.
- The local AAC excerpt was stream-copied from `Stock_app_audiograph.mov` at approximately 18.92–28.74 seconds. The chart image is a crop of the 25-second frame. The waveform is the peak envelope of the decoded samples and shows audio progress independently of the chart.
- Keep the sighted novice observations separate from the blind and low-vision interview. The preview uses paraphrases. Add quotations only once the wording and permission for public use are verified.

### COIN chart handoff for Section 3

- Keep the verified 1132 × 650 crop in `public/research/apple-stocks-coin.webp` as the visual reference. The crop uses the frame at about 25 seconds from the original research recording, `Stock_app_audiograph.mov`. `public/research/earmark-coin.webp` recolors that crop in place. It contains the same geometry.
- `CoinChart` and `CoinOverlay` in `src/components/ResearchStory.tsx` own image placement and annotations in the crop’s coordinate space. `AppleAudioGraph` owns playback of `public/research/apple-stocks-voiceover.m4a`. Its waveform is an audio amplitude envelope, independent of the chart coordinates.
- The recording verifies the ticker, one-year span, USD scale marks, and labeled months. Obtain the original ordered observations and dates, confirm the sampling and price basis against the recording, then project the verified points against the same axis bounds. Check that the overlay preserves the original shape before using those observations to calculate piano pitches. Carry the source units, timestamps, interpolation policy, and tested pitch mapping alongside the data.
- Keep showing the source image while the original observation series is unavailable. Pixel coordinates support visual emphasis only. Avoid reading precise observations or timestamps from the image or estimating them from the Apple audio. Any separate teaching dataset needs a clear label and its own chart.

### Media attribution and publication

The chart is credited to Apple Stocks, and the excerpt to Apple Stocks and VoiceOver, in the interface. The original QuickTime recording is kept outside Git. The local commit contains the research audio excerpt and the original and recolored chart crops. Public redistribution clearance for those assets has not been verified. Confirm clearance and any required credits before publishing this commit. [Apple rights and permissions](https://www.apple.com/legal/intellectual-property/).

## Sections 3 and 4 preview

- Section 3 uses the React Bits Sliced Waves TS-CSS source with a five-color static SVG fallback. Motion runs briefly while in view, and the effect represents atmosphere independently of the Apple or Earmark audio.
- Section 4 labels its switch from the COIN research screenshot to the prototype’s `stock` graph. No verified point series for the one-year COIN recording was found. The 20 sample prices and the note sequence come from the prototype source.
- The website uses the prototype’s Salamander piano sources, unit output gain, pitch mapping, six-second sequence, five-percent note gap, and five 450 ms reference notes. The transport adds pause and resume using the audio clock. Resuming starts future attacks at their original relative times and rejoins any interrupted samples at their saved phase and release gain.
- The introduction uses browser speech synthesis with an English voice at 0.95 rate. Graph title, axes, extrema, starting value, pitch-step units, reference notes, and duration remain in the protocol. Browsers without a speech voice can play the reference notes and read the introduction. A future human recording could cover this specific introduction while leaving dynamic pause values available as text or optional browser speech.
- Piano recordings are fetched from the prototype’s original Tone.js Salamander URLs. Credit Alexander Holm and retain the sample distribution’s [CC BY 3.0 attribution](https://github.com/Tonejs/audio/tree/master/salamander).
