# Hyperframes Composition Brief: WaterlooBudget

## Objective
Create a short, real-product launch-style brag video for WaterlooBudget, a budget guide to Waterloo, Ontario built with a deliberate thermal-receipt visual identity.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 19 seconds

## Source Material
- Project root: `/Users/tribalscale/projects/waterloo-budget`
- Primary files read: `src/app/globals.css` (design tokens), `src/components/ui/SpotCard.tsx`, `src/components/features/SpotsList.tsx`, `src/components/features/LeafletMap.tsx` / `MapView.tsx`, `src/components/ui/CategoryIcon.tsx`, `src/app/teams/[id]/page.tsx`, `src/app/layout.tsx`
- Product name: WaterlooBudget
- Tagline / strongest claim: "A receipt for your life in Waterloo."
- Key UI or visual moment to recreate: the receipt-styled spot card (category tag, price, title, meta, dashed divider, Log Spend button) and the custom category-icon map markers
- Copy that must appear verbatim:
  - "WATERLOO" / "BUDGET" (two-tone wordmark, exactly as in the real nav: "WATERLOO" in ink, "BUDGET" in orange)
  - "A receipt for your life in Waterloo."
  - "Mozy's Shawarma" — "Uptown Waterloo · Middle Eastern" — "~$11" — "Huge portions shawarma" — "usually busy"
  - "Budget-friendly spots. Curated, not crowdsourced."
  - "See it on the map."
  - "dinner" / "Paid by Virat · Sep 10" / "$5.00" / "user dummy — $1.67" / "dummy user — $1.67" / "SETTLED"
  - "Log spend. Split with your team."
  - "Built for students who check the receipt."
  - "Live now — waterloo-budget.vercel.app"

## Creative Direction
- Tone preset: app-store
- Creative direction: an honest, confident feature tour of a real student-built app — not a joke, not a parody. The receipt aesthetic itself is the visual hook.
- Interpretation: title-case feature labels, one feature per scene, clean slide/wipe transitions (0.35–0.45s), no aggressive motion, CTA-style outro.
- Angle: treat WaterlooBudget's own thermal-receipt design system (hard ink drop-shadows, dashed dividers, monospace type, one orange accent) as the video's entire visual language — recreate real screens rather than inventing generic marketing graphics.
- Hook: the two-tone wordmark prints onto a cream background with a dashed rule drawing beneath it, then the tagline settles in.
- Outro / punchline: wordmark returns full-size, "Built for students who check the receipt.", then a small "Live now — waterloo-budget.vercel.app" CTA line.
- Avoid:
  - Generic SaaS language ("streamline", "workflow", "unlock")
  - Abstract filler visuals, color washes, particle/gradient backgrounds
  - Any redesign of the product's look — colors, borders, shadows, and type must match the real app exactly (see Visual Identity)
  - Real personal data beyond what's already public product copy/seed data (the sample names/amounts above are the app's own placeholder/demo content, not real user PII)

## Visual Identity
- Background: #f3efe4 (cream)
- Text: #1b1a17 (near-black ink)
- Accent: #ff5a1f (orange) — used sparingly: price text, one word of the wordmark, "usually busy" dot, expense amount
- Display font: "Space Mono", bold weight — fall back to a bundled monospace if Space Mono isn't available in the render environment
- Body font: "Space Mono", regular weight
- Visual references from the project:
  - Card: 1.5px solid ink border, 5px/5px hard ink drop-shadow (no blur), cream fill, ~20px padding
  - Category tag: solid ink background, cream uppercase text, small tracked letter-spacing
  - Divider: 1px dashed ink rule
  - Buttons: outlined ink border, cream fill, uppercase bold label
  - Map markers: solid black circular dots with a simple white line-icon glyph (fork+knife+plate for food)

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Receipt hook — 3s — wordmark prints in, dashed rule draws, tagline settles
2. Spots feature — 4.5s — real spot card (Mozy's Shawarma) arrives with its full detail and drop-shadow
3. Map feature — 4s — category markers on a simplified map, food marker drops in and settles
4. Teams feature — 4.5s — expense row with two members' shares settling to "SETTLED"
5. Outro / CTA — 3s — wordmark returns, punchline, "Live now" CTA

## Audio
- Audio role: warm bed, sparse professional accents
- Audio arc: fade in under the hook, steady low bed under the three feature scenes, fade out under the closing wordmark
- Music: choose a light, warm, restrained instrumental bed from Hyperframes' bundled library (app-store/clean mood — not lo-fi, not cinematic, not chaotic)
- Music treatment: fade-in ~0.3s at scene 1 start, steady low volume through scenes 2-4, fade-out across scene 5
- Music cue guidance: detect cues at composition time; if a suitable strong cue lands near the Scene 2 card-arrival or Scene 3 marker-drop, lock the reveal within ±0.15s of it — otherwise use natural timing. No beat-grid sequencing required (no long sequential list in this storyboard).
- Audio-reactive treatment: subtle — the spot card's drop-shadow presence may breathe very slightly with music RMS; nothing else reacts. No waveform, no glow, no pulsing.
- Audio-coupled moments:
  - Scene 1 wordmark settle — soft print/stamp tick
  - Scene 2 card arrival — one card-arrival tick on landing
  - Scene 3 marker drop — one soft drop/tick on landing
  - Scene 4 SETTLED tags — one light check tick per tag (two total, close together)
- SFX selection guidance: sparse, tactile, low high-frequency-risk sounds; nothing cartoonish or comedic; each SFX should match the motion it's tied to
- SFX analysis guidance: use the current hyperframes `sfx-analysis.md`/json if present to bias toward low-fatigue sounds for these small, repeated-feeling ticks
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation
- Audio files: copy the chosen music (and any Hyperframes-selected SFX) into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). This is `/brag`'s own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo/launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project (the spot card and the map markers both qualify — use both).
- Keep all text readable in the final render; respect WCAG contrast (cream/#f3efe4 background with ink/#1b1a17 text and orange/#ff5a1f accent should pass, but verify with `hyperframes check`).
- Keep the video within 15-25 seconds (target 19s per the plan).
- Include the planned music/SFX layer.
- Treat the audio notes above as guidance, not a fixed cue sheet — choose exact SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints; ignore cues that hurt readability or pacing.
- Use SFX to support motion: a print/stamp tick, a card-arrival tick, a drop tick, and two check ticks — restraint over density.
- When music is present, consider the audio-reactive workflow for one subtle element (card shadow presence) only — avoid waveform/particle/pulsing visuals.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
