# Earmark design direction

## Creative philosophy

Earmark is a love letter to a project worth making even if few people see it. The public site celebrates the curiosity that led a UCLA CS 188 team in Fall 2026 to ask how people, especially blind and low-vision readers, could explore continuous graphs through sound. The course theme, “Enabling Novel Data Interactions,” comes to life when a visitor can experience a pattern as piano pitches and inspect the same pattern in text.

Make it feel like a short editorial film. Establish the question, give the graph room to hold attention, and change pace when the story moves from encounter to explanation. Let typography, whitespace, and the graph do most of that work. Write with the warmth and precision of someone sharing an experiment they care about. Ground claims in what the existing prototype does and what the team can document.

The primary CTA is **Explore Earmark**, an ordinary link to the [live prototype](https://earmark-pi.vercel.app/). An optional link into the showcase example is secondary and uses a distinct label such as **Try the piano example**. The [prototype source](https://github.com/harshita-cmyk/earmark) belongs to a separate repository.

## Reading the logo

A thick continuous line crosses a rounded black lowercase wordmark. It starts low in blue, climbs through violet to a ringed high point, moves through magenta, drops into a cyan trough, and rises to green. Four hollow circles punctuate the line. The crossings make the graph inseparable from the wordmark, and the rings suggest positions one might inspect. Those are useful motifs for the showcase. The supplied artwork has no labeled scale, so its contour works as identity. The example plot has its own data and scale.

Keep the full wordmark intact on a white field. Start with clear space on each side equal to one marker diameter in the displayed artwork. Review legibility after the production file arrives, especially if it includes substantial white margins. Give a linked logo the accessible name “Earmark.” When adjacent text already supplies the name in the same link, use empty image alt text.

## Two directions

### A. A Line You Can Hear

An editorial page on white. A large, left-aligned serif question gives the first screen its shape. An open, asymmetrical composition pairs the opening copy with a still preview of the example plot. On mobile, the same figure follows the opening copy. The figure becomes the first section’s playable example, with the same trend described in words and expanded into a table. Below it, the article shifts to a narrower measure for the method and research notes. The logo’s rings return at the exact observations discussed in the figure caption.

**Critique.** The human question gives visitors a reason to try the example, and the graph demonstrates the premise before the technical explanation. A second, purely decorative hero curve would dilute the idea. Use one continuous figure for the opening and playback and label its axes from first paint.

### B. The Listening Room

A near-black exhibition space that opens directly on a large graph and transport controls. One stable cursor shows the current sample in a high-contrast plot. A typographic readout beneath it gives the sample position, value, and piano note. On wide screens, the controls and the graph sit side by side like a score and its interpretation. On mobile, the plot, controls, and readout form one compact vertical sequence. Research notes follow in a white reading section.

**Critique.** The instrument-like opening gives repeat visitors immediate access to the example. For a first visit, it asks people to interpret a plot and a transport before they know why either matters. A full-width dark stage also pushes the black wordmark onto a white island or calls for a variant the team hasn't supplied.

### Working direction

Use **A Line You Can Hear** as the working art direction for section proposals. The composition below is a starting point for review. A visitor encounters the research question, the mapping, and a concrete trend in a single sequence. The white page gives the existing wordmark a natural home. The plot provides the same focal point with audio off, and its labeled observations make the graphic useful to the story. Reserve the strongest motion for the moment a visitor chooses to play.

## Composition

Use a single page with a quiet wordmark header and three short links for the example, research, and prototype. Let the links wrap at narrow widths. Use one headline, one short introduction, and the primary **Explore Earmark** link. If the example needs a jump link, give it secondary emphasis. On wide screens, align the figure title or plot with the opening copy, and keep the transport, summary, and value disclosure together below the plot. Keep heading and focus order consistent with the mobile reading order.

```text
Compact                        Wide
[Wordmark] [Links wrap]        [Wordmark]                     [Links]
[Question]                     [Question             ] [Example heading]
[Intro and primary link]       [Intro and primary link] [Labeled plot    ]
[Example heading]                                      [Transport       ]
[Labeled plot]                                         [Trend and values]
[Transport]
[Trend and values]             [How it works · Research notes · Try it]
[How it works]
[Research notes]
[Try the prototype]
```

Start with 16 px gutters at compact widths and scale to 56 px on wide screens. Cap the main grid near 76 rem and prose near 62 characters. Start the two-column composition around 56 rem and adjust where the copy and plot stop fitting comfortably. Use a 4, 8, 12, 16, 24, 32, 48, 64, 96 px spacing scale. Use 48–64 px between sections on compact screens and 80–112 px on wide screens. Use thin rules to distinguish figure metadata and section boundaries where spacing alone is insufficient.

## Typography

| Role | Proposed face | Size and rhythm |
| --- | --- | --- |
| Opening question | Instrument Serif, Georgia fallback | 44–96 px equivalent, fluid in rem, around 1.02 line height |
| Section headings | Instrument Serif, Georgia fallback | 32–52 px equivalent, around 1.12 |
| Reading text | Instrument Sans, system sans fallback | 17–19 px equivalent, 1.55–1.65 |
| Controls and data | Instrument Sans, system sans fallback | 16 px equivalent, medium weight, tabular numerals for values |
| Figure notes and axes | Instrument Sans, system sans fallback | 14–16 px equivalent, at least 1.4 |

Keep the question to a few short lines through measure. Let it wrap naturally under zoom or with fallback fonts. Use sentence case, visible link underlines, and normal tracking for small text.

## Color and visual language

| Role | Color | Contrast on white |
| --- | --- | --- |
| Page | `#FFFFFF` | — |
| Ink and functional chart stroke | `#121212` | 18.73:1 |
| Secondary copy and figure labels | `#505050` | 8.06:1 |
| Functional rules and axes | `#595959` | 7.00:1 |
| Links and focus outline | `#0047CC` | 7.57:1 |

Use a 2 px blue focus outline with a 3 px offset and sufficient space around controls. Give the primary CTA link white text on ink. In forced colors, let the browser substitute system colors and preserve markers, borders, and focus. If a dark surface is later needed, start with `#121212` and white ink (18.73:1) and `#A9C4FF` for links and focus (about 10.76:1).

Take the gradient stops from the final logo artwork. Blue, violet, magenta, cyan, and green can run along a decorative companion stroke or appear inside selected rings. Keep a high-contrast graph stroke, labels, and marker outlines legible independently of that color. Use position, an outlined marker, and text together to identify the current sample. Keep decorative strokes quiet enough that they cannot be mistaken for another series. The chart and its annotations supply the imagery.

## Interaction and motion

- Lead with a labeled plot and the sentence “As values get higher, the piano notes get higher.” Offer **Play piano example**, a contextual **Pause** or **Resume**, and **Restart** once playback begins. Preview the approximate duration beside Play. Start sound only from a deliberate activation.
- Synchronize one cursor to the audio clock. On pause, hold the position. On restart, return to the first observation and begin again. At completion, leave the last position visible and offer **Replay piano example**. Preserve focus on the activating control across label and state changes.
- Provide a readout of sample, value, and note with **Previous point** and **Next point** buttons. Moving to a point from these controls is silent and pauses active playback. The adjacent summary names the direction changes. A native disclosure labeled **Read the data values** opens a table with a caption and scoped column headers.
- Announce discrete status changes such as playback failure or completion through a polite status region. After deliberate point navigation, make the selected point available without streaming announcements for each timed note. Keep programmatic changes out of the focus order and avoid competing speech.
- Show a short loading state if the audio is still preparing. If playback fails, show “The piano example couldn’t play. You can still explore each point or read the data values.” Keep a retry action available.
- Keep the plot still on arrival. During playback the cursor is the only continuous animation. Under reduced motion, use a static plot with immediate updates on deliberate point navigation and playback state changes. Keep essential copy and controls visible at first paint. For any approved decorative effect, render a static equivalent when reduced motion is requested, including when that setting changes during the visit.

## Accessibility acceptance criteria

- Use landmarks, a skip link, sequential headings, native links and buttons, and an accessible figure name and description. Provide axes, units, trend, and values in HTML around the visual. Hide decorative paths from assistive technology.
- All controls work by keyboard and touch. Make interactive controls at least 44 × 44 CSS px as a design target. Focus stays visible and unobscured. Visiting a link or focusing the plot does not start audio.
- The reading experience and exact values work with muted, unsupported, or blocked audio. A visitor can read and navigate with a screen reader without starting the piano.
- Check text contrast against 4.5:1 for normal text and 3:1 for qualifying large text. Check necessary non-text marks and control states against 3:1. Test real composited colors, forced colors, 200% text resize, WCAG text-spacing overrides, and 320 CSS px reflow. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- The Apple Design review informed the familiar transport controls, meaningful chart descriptions, and adaptable hierarchy. WCAG defines the web conformance target. [Apple Accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [Apple Charting Data HIG](https://developer.apple.com/design/human-interface-guidelines/charting-data) · [Apple VoiceOver HIG](https://developer.apple.com/design/human-interface-guidelines/voiceover)

## Tooling and repository baseline

The website repository currently holds PRODUCT.md, DESIGN.md, IMPLEMENTATION.md, and the skills lock. The logo reference has been shared and its production file is expected under `public/images/`. A framework and styling system are still open. React with TypeScript is the baseline for approved React Bits components. Choose an app scaffold and styling approach when the first section enters implementation.

- **Impeccable** guides art direction, type, hierarchy, layout, critique, and polish. Its local copy is available in the neighboring workspace at `../anti-ableism-ucla/.agents/skills/impeccable/SKILL.md` (v4.8.2). From the Earmark root, its launcher is `../anti-ableism-ucla/.agents/skills/impeccable/scripts/impeccable context`. Ask for Impeccable’s `shape` workflow during a section proposal, then `critique` or `polish` once there is a render. To install a project-local copy later, run `npx skills add pbakaus/impeccable` from Earmark and select Codex. [Official installation](https://impeccable.style/#install)
- **Apple Design** is installed in `.agents/skills/apple-design/SKILL.md` and listed in `skills-lock.json`. Ask Codex to use Apple Design to review the section’s interaction. Read the skill and the relevant HIG references before reviewing navigation, labels, focus, responsive behavior, or playback. Translate Apple guidance to native web controls and use WCAG 2.2 AA for the web target. [Apple Design Skill](https://github.com/dickwu/apple-design-skill#use-it)
- **Playwright MCP** is connected. Navigation and page evaluation worked against the rendered React Bits documentation, and the seven TypeScript/CSS registry entries returned source manifests. Use it on each implemented section for rendered desktop and mobile inspection, keyboard operation, focus, and motion checks. Pair accessibility snapshots with manual assistive technology checks when applicable.

## React Bits integration

Use React Bits as a source of individual, editable components. Once a section is approved, inspect the chosen component’s Code tab and import only that component and its dependencies. Prefer TS-CSS if the project uses plain CSS, or TS-TW if Tailwind is already configured. The docs show the shadcn registry method, for example `npx shadcn@latest add @react-bits/SplitText-TS-TW`, and a manual method that copies the source and adds its listed dependencies. Use the CLI with a configured registry or use the official Code tab to copy the chosen files. Review each component’s source, license, dependency footprint, runtime behavior and static fallback before it ships. [Catalog](https://reactbits.dev/get-started/index) · [Installation](https://reactbits.dev/get-started/installation)

| Component | TS-CSS registry dependencies | Fit to evaluate in a section proposal |
| --- | --- | --- |
| [Split Text](https://reactbits.dev/text-animations/split-text) | GSAP, @gsap/react | One brief word-level entrance if it improves the pacing. Preserve a coherent semantic heading and a readable static state. |
| [Gradient Text](https://reactbits.dev/text-animations/gradient-text) | None listed | A short accent where every color and state passes contrast. The graph stroke remains the natural home of the full brand gradient. |
| [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal) | GSAP | Low priority for editorial copy. A continuous blur or delayed reveal can interrupt reading. |
| [Animated Content](https://reactbits.dev/animations/animated-content) | GSAP | A single brief transition for a supporting visual when it marks a meaningful change in the story. |
| [Crystalized Ball](https://reactbits.dev/animations/crystalized-ball) | OGL | Low fit. The pointer-driven glass effect has little relationship to how Earmark maps data to sound. |
| [Sliced Waves](https://reactbits.dev/backgrounds/sliced-waves) | None listed | Low fit near the graph. A moving wave could be mistaken for encoded data. Consider only if a section gives it a clear visual purpose and a static fallback. |
| [Scroll Expand](https://reactbits.dev/animations/scroll-expand) | None listed | Consider if an actual research artifact benefits from a wider view. Preserve natural scrolling and reading order. |

An effect earns its place by guiding attention or explaining a change. Test it with reduced motion, keyboard input, touch, and a slow load. Check for duplicate screen reader text from split markup, transient contrast failures, and controls that lose focus during a transition.

## One section at a time

1. Agree on the section’s storytelling goal.
2. Propose the composition, copy hierarchy, interaction, and any React Bits candidate. Describe the static and reduced-motion states.
3. Wait for approval, then implement only that section.
4. Inspect the rendered section with Playwright MCP. Refine composition with Impeccable and interaction with Apple Design.
5. Test keyboard operation, focus, contrast, zoom and reflow, reduced motion, and the section’s screen reader behavior. Check narrow and wide layouts and verify that audio starts only on request wherever audio is present.
6. Commit the finished section and pause for approval before moving on.
