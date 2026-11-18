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
