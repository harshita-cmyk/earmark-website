# Earmark product brief

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product purpose

Earmark is a UCLA CS 188 HCI research prototype developed for the Fall 2026 course theme “Enabling Novel Data Interactions.” This companion site invites people to ask why understanding a graph should depend on sight, then gives them a small example they can explore through piano notes, a plotted line, and text.

A line graph makes relationships visible at a glance. Sonification, the mapping of data to sound, makes those relationships unfold over time. Earmark explores what someone can recognize from pitch and timing and what additional context they need to identify a value. Giving people more ways to explore the same data can change who gets to participate in the conversation around it.

## Users

- **Primary.** Blind and low-vision visitors exploring how graph sonification works and whether it gives them a useful way to inspect a trend. Design for varied combinations of screen readers, magnification, keyboards, touch, and residual vision.
- **Secondary.** HCI students, researchers, educators, and curious visitors who want to experience the interaction, understand the design decisions, or evaluate the prototype.
- **Across audiences.** Visitors may have sound muted, be unable to hear the example, or prefer to read. Give them the same trend, values, and mapping explanation.

Success means a visitor can describe a sample graph's shape, locate an exact sample value, explain how value and position become pitch and time, and find the full prototype.

## Prototype and evidence

The prototype offers a Tutorial for recognizing shapes, a Test where the chart is revealed after the answer, and a Playground for playing graphs and inspecting note sequences. Its README describes a six-second sequence in a C3–C6 piano range, with a spoken introduction for the axes, low and high values, starting value, and size of a pitch step. Pressing Stop reports the value at the current position. [Prototype README](https://github.com/harshita-cmyk/earmark/blob/main/README.md)

The implementation quantizes values into discrete pitch steps. Nearby values can share a note. Numeric x distances affect timing, and categorical observations get equal spacing. The public demonstration should explain the distinction between recognizing the contour and retrieving exact values. [Sonification source](https://github.com/harshita-cmyk/earmark/blob/main/src/audio/sonification.ts)

The reviewed sources document implementation and exercises. Study methods, participant observations, and measured outcomes require team-supplied evidence. Label verified design observations as such and keep research questions open until evidence supports a conclusion.

## Content and visitor journey

| Section | Visitor question | Material |
| --- | --- | --- |
| Opening | Why should understanding a graph depend on sight? | One direct question, a short description of Earmark, and a link to the example. |
| Interactive example | What happens when data becomes something I can hear? | One short, labeled illustrative series with a rise, a dip, and a recovery. Provide piano playback, a plot, a trend description, and an exact-value view. |
| How it works | What am I hearing? | Explain playback order, pitch steps, and the cues the full prototype offers for calibration and reading values. |
| Research notes | What did building Earmark surface? | Explain documented choices such as calibrating pitch, teaching shapes before asking for values, and exposing values on demand. Add attributed findings when available. |
| Try the prototype | Where can I go further? | Describe Tutorial, Test, and Playground and link to the live prototype and source. |

The README lists the [live prototype](https://earmark-pi.vercel.app/). The [source repository](https://github.com/harshita-cmyk/earmark) is a second route for visitors who want to see how it works.

## Brand commitments

Use the supplied lowercase wordmark and multicolor line as the source of identity. Write in plain, precise language. Explain what a person can do, give concrete examples, and describe blind and low-vision visitors as people making sense of data on their own terms.

## Capabilities and constraints

- Keep the showcase in its own repository. The full Tutorial, Test, and Playground belong to the original prototype.
- Plan for a mobile-first public page with a WCAG 2.2 AA target, user-initiated sound, equivalent text and data, and reduced-motion support.
- The embedded example is a proposed teaching excerpt. Label its dataset and any simplified mapping so visitors can distinguish it from the full prototype protocol.
- The uploaded logo is the current visual reference. The owner will add the production image under `public/images/` during setup.
- Framework and hosting remain open. Team credits, asset licensing for the piano audio, and any publishable study results need verification before launch.
