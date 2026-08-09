# HTML Drums

A zero-dependency vanilla JavaScript library (bookmarklet-first) that turns any web page into a percussion instrument. It injects a floating overlay panel where users select a classic drum machine sound bank, hit play, and hear the DOM come alive — each element triggering a drum hit as the script traverses the tree depth-first in time with a configurable BPM.

Sounds are sourced from the [Strudel CDN](https://strudel.b-cdn.net) (the same sample pack used by the Strudel live-coding environment).

---

## Sound Sources (Strudel CDN)

Base URL: `https://strudel.b-cdn.net/tidal-drum-machines/machines/`

File naming convention:

```
{folder}/{machineNameLower}-{soundAbbrev}/{File}.wav
```

Example:
```
RolandTR909/rolandtr909-hh/hh04.wav
```

> Base CDN URL pattern: `https://strudel.b-cdn.net/tidal-drum-machines/machines/{folder}/{lowercase}-{sound}/{File}.wav`

Sound abbreviations follow the standard drum machine convention:

| Abbrev | Sound              |
|--------|--------------------|
| `bd`   | Bass Drum (kick)   |
| `sd`   | Snare Drum         |
| `hh`   | Closed Hi-Hat      |
| `oh`   | Open Hi-Hat        |
| `ht`   | High Tom           |
| `mt`   | Middle Tom         |
| `lt`   | Low Tom            |
| `rd`   | Ride Cymbal        |
| `cr`   | Crash Cymbal       |
| `cp`   | Clap               |
| `rim`  | Rim Shot           |
| `cb`   | Cowbell            |
| `sh`   | Shaker             |
| `tb`   | Tambourine         |
| `perc` | Percussion (misc)  |
| `misc` | Miscellaneous      |
| `fx`   | Effects            |

Each sound has N variations (e.g., `bd00.wav` through `bd03.wav` for 4 variations), picked at random or round-robin per hit.

---

## Curated Drum Machine List

A tight selection of the 10 most iconic drum machines (verified against CDN data):

| # | Name | Folder | Era / Vibe |
|---|------|--------|------------|
| 1 | Roland TR-808 | `RolandTR808` | 1980 / Hip-hop, electro, pop |
| 2 | Roland TR-909 | `RolandTR909` | 1984 / House, techno |
| 3 | Roland TR-707 | `RolandTR707` | 1985 / Classic house |
| 4 | Roland TR-606 | `RolandTR606` | 1981 / Acid, lo-fi |
| 5 | LinnDrum | `LinnDrum` | 1982 / Prince, 80s pop |
| 6 | Oberheim DMX | `OberheimDMX` | 1981 / New Order, hip-hop |
| 7 | E-mu SP-12 | `EmuSP12` | 1985 / Golden age hip-hop |
| 8 | Akai MPC60 | `AkaiMPC60` | 1988 / Hip-hop, R&B |
| 9 | Simmons SDS-5 | `SimmonsSDS5` | 1982 / Electronic drums |
| 10 | Roland CR-78 | `RolandCompurhythm78` | 1978 / Vintage electro |

> All machine folders and sound files verified to exist on the CDN. Sound-to-machine mappings are resolved via `mappings.js`.

---

## Core Architecture

### Overview

```
┌─────────────────────────────────────────────────────┐
│  html-drums.js  (single JS file, IIFE, no deps)     │
│                                                      │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Sound Loader│  │  DOM Walker│  │  Audio Engine │  │
│  │  (preload)  │  │ (traversal)│  │  (playback)   │  │
│  └──────┬──────┘  └─────┬──────┘  └──────┬───────┘  │
│         │               │                │           │
│  ┌──────┴───────────────┴────────────────┴───────┐  │
│  │              Overlay UI (panel)                │  │
│  │  [Machine ▼] [BPM ───○───] [▶/⏸] [Volume] [⚙] │  │
│  │  [Legend / Mapping editor (expandable)]        │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         Mapping Engine                        │   │
│  │  tag → sound type + variation picker          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Delivery Formats (all from the same source file)

1. **Bookmarklet** (primary) — a minified `javascript:(function(){...})()` link that the user drags to their bookmarks bar. Clicking it on any web page injects the full HTML Drums experience.
2. **Console snippet** — copy-paste a `<script>` tag into the browser console.
3. **Embeddable script tag** — `<script src="html-drums.js"></script>` for site owners who want it permanent.
4. **Example demo site** — a standalone HTML page explaining the project with a drag-to-bookmarks-bar link.

---

## Feature Specification

### 1. Overlay Panel UI

Positioned fixed, top-right corner. Compact by default, expandable via a gear/settings icon.

#### Compact Mode (default)
- Drum machine dropdown (curated list, 18 entries)
- BPM slider (range: 30–300, default: 120) with numeric display
- Play/Pause toggle button (▶ / ⏸)
- Volume slider (0–100%, default: 80%)
- Settings gear icon (⚙) to expand

#### Expanded Mode (via ⚙)
- Full mapping editor (see §2)
- Legend showing current tag→sound assignments
- Additional audio settings (choke groups, etc.)

#### Styling
- Dark semi-transparent background (`rgba(0,0,0,0.85)`)
- Rounded corners, subtle border
- Compact: ~200px wide, minimal height
- Font: system UI font stack
- z-index: 2147483647 (max safe)
- Draggable? — Stretch goal. Fixed position for MVP.

### 2. Sound Mapping Engine

Maps HTML elements to drum sounds. Two modes, toggleable:

#### Mode A: Tag-based (default, simple)
Each HTML tag is assigned one sound type. Default preset:

| HTML Tag(s)      | Sound | Description                |
|-------------------|-------|----------------------------|
| `body`            | `bd`  | Kick — the "root" hit      |
| `header`, `nav`   | `sd`  | Snare                      |
| `main`, `article` | `bd`  | Kick (structural anchor)   |
| `section`, `div`  | `hh`  | Hi-hat (filler rhythm)     |
| `h1`              | `cr`  | Crash — big headings        |
| `h2`, `h3`        | `oh`  | Open hi-hat                 |
| `h4`, `h5`, `h6`  | `rd`  | Ride                        |
| `p`               | `hh`  | Hi-hat                      |
| `a`               | `rim` | Rim shot — clickable        |
| `button`          | `cp`  | Clap — interactive          |
| `img`             | `cr`  | Crash — visual element      |
| `ul`, `ol`        | `mt`  | Mid tom                     |
| `li`              | `hh`  | Hi-hat                      |
| `span`, `em`      | `hh`  | Hi-hat (inline)             |
| `table`           | `lt`  | Low tom                     |
| `tr`              | `ht`  | High tom                    |
| `td`, `th`        | `hh`  | Hi-hat                      |
| `form`, `input`   | `sd`  | Snare                       |
| `footer`          | `bd`  | Kick (closing hit)          |
| `*` (fallback)    | `hh`  | Hi-hat (default)            |

#### Mode C: Tag + Depth (advanced)
Same as Mode A, but nesting depth determines the sample variation number. Depth 0 elements get `sound:0`, depth 1 get `sound:1`, etc., wrapping around if depth exceeds available variations.

> Users can fully customize mappings in the expanded panel. Mappings are stored as a JS object: `{ "tagName": "soundAbbrev", ... }`. A "Reset to default" button restores the preset.

**Preset system:** Several built-in presets (tag-based, depth-based, random, etc.) that users can switch between and modify.

### 3. DOM Traversal & Playback

#### Traversal
- **Method:** Depth-first pre-order traversal of `document.body` (root → leftmost child → deeper → then siblings).
- **Scope:** Only elements inside `<body>`. Skip `<script>`, `<style>`, `<noscript>`, `<template>`, and the overlay panel itself.
- **Visible-only option:** (stretch goal) skip elements with `display: none` or zero dimensions.
- Each visited element triggers exactly one drum hit.

#### Timing
- BPM-controlled step rate. Default: 120 BPM → 2 steps per second (500ms interval).
- BPM slider: 30–300, mapped to `setInterval` or `requestAnimationFrame` + accumulator pattern for precise timing.
- Each "tick" advances to the next element in traversal order.

#### Looping
- When traversal completes (reaches end of DOM), immediately restart from `<body>` (infinite loop).
- Play/Pause toggles the loop.
- A "Single pass" checkbox in expanded settings (stretch goal).

#### Highlight Animation
- On each hit, the target element gets:
  - `transform: scale(1.05)` for 120ms (CSS transition: 80ms ease-out, 120ms ease-in back to 1.0)
  - Background-color flash: semi-transparent color matching the sound type for 150ms
  - Color map:

| Sound | Flash Color            |
|-------|------------------------|
| `bd`  | `rgba(255, 80, 80, 0.3)`  (red)     |
| `sd`  | `rgba(255, 200, 50, 0.3)` (amber)   |
| `hh`  | `rgba(100, 200, 255, 0.3)` (blue)   |
| `oh`  | `rgba(80, 160, 255, 0.3)` (sky)     |
| `cr`  | `rgba(255, 255, 100, 0.4)` (yellow)  |
| `rd`  | `rgba(200, 150, 255, 0.3)` (purple) |
| `cp`  | `rgba(255, 150, 200, 0.3)` (pink)   |
| `rim` | `rgba(255, 180, 100, 0.3)` (orange) |
| toms  | `rgba(100, 255, 150, 0.3)` (green)  |
| other | `rgba(200, 200, 200, 0.3)` (gray)   |

- No permanent DOM modifications — highlight is applied and removed via inline styles, cleaned up after animation ends.

### 4. Audio Engine

#### Sound Preloading
- On drum machine selection change, fetch all `.wav` files for that machine's sound set.
- Use `fetch()` → `arrayBuffer()` → `AudioContext.decodeAudioData()`, stored in an `AudioBuffer` cache.
- Show a small spinner/indicator while loading.
- If preload fails for a file, skip it silently (some machines may be missing certain sounds or the CDN structure may differ).

#### Playback
- Use the Web Audio API (`AudioContext`). Create on first user interaction to comply with autoplay policies.
- Each hit: create a `BufferSourceNode` from the preloaded buffer → connect to a master `GainNode` (volume control) → `start()`.
- **Choke groups (optional, in settings):** Sounds in the same choke group cut each other off:
  - `hh` and `oh` (closed hi-hat cuts open hi-hat)
  - toms (`ht`, `mt`, `lt`) in the same group (optional)
- **Polyphony:** By default, sounds can overlap. Choke groups can be configured to limit this.

#### Volume
- Master `GainNode` controlled by the volume slider.
- Individual sound volume adjustments in expanded settings (stretch goal).

### 5. Persistence

- Settings saved to `localStorage` (per domain? Or global? — **Global** for simplicity, key: `html-drums-settings`).
- Persisted settings: selected machine, BPM, volume, mapping mode, custom tag mappings, choke group settings.

---

## Technical Constraints

- **Zero dependencies** — Pure vanilla JS (ES2015+). No jQuery, no frameworks.
- **Single file** — Everything in one `.js` file.
- **Minifiable** — Code should be structured to survive minification for the bookmarklet use-case.
- **Self-contained CSS** — All styles injected inline by the script. No external stylesheet.
- **No global pollution** — Wrap everything in an IIFE. Only expose `window.HTMLDrums` (for API access) and the `html-drums-styles` style element.
- **Cross-browser:** Target modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions).
- **Size target:** < 50 KB minified (excluding audio, which is streamed from CDN).
- **No build step required** for development — just edit and reload. Optional minification step for the bookmarklet.

---

## File Structure

```
html_drums/
├── SPECS.md                          # This document
├── html-drums.js                     # Main library (dev, unminified)
├── html-drums.min.js                 # Minified bookmarklet-ready version
├── mappings.js                       # Sound tag → machine folder + file mappings
├── example/
│   └── index.html                    # Demo/landing page with drag-to-bookmark
├── references/
│   ├── drum-machines.txt             # Full machine list with sound counts
│   └── strudel_basics.md             # Strudel reference notes
└── README.md                         # Usage instructions
```

---

## Example Site (`example/index.html`)

A clean, self-explanatory page that:
- Explains what HTML Drums is in a few sentences
- Has a prominent "Drag this link to your bookmarks bar" call-to-action
- Includes the bookmarklet link as an `<a>` with `href="javascript:..."`
- Shows a "Try it here!" button that dynamically loads the script for a live demo
- Has enough HTML content (headings, paragraphs, lists, images, links, buttons) to make a good demo when the drum machine runs
- Links to the GitHub repo / source

---

## Development Phases

### Phase 1: Core Engine (MVP)
- [ ] Audio engine: `AudioContext`, sound loading from CDN, playback
- [ ] DOM walker: depth-first traversal with configurable BPM
- [ ] Basic highlight: scale + background color flash
- [ ] Minimal overlay: machine dropdown, play/pause, BPM slider, volume
- [ ] Tag-based default mapping (Mode A)
- [ ] Bookmarklet wrapper
- [ ] Example site

### Phase 2: Enhanced Features
- [ ] Expanded settings panel with mapping editor
- [ ] Mode C (tag + depth) toggle
- [ ] Custom mapping presets + save/load
- [ ] Choke groups
- [ ] `localStorage` persistence
- [ ] Preload progress indicator

### Phase 3: Polish
- [ ] Console-snippet and embed formats
- [ ] Minification pipeline
- [ ] Browser testing
- [ ] README / documentation
- [ ] Performance optimization for very large pages (throttle highlight, yield to main thread)

---

## Open Questions / Decisions Pending

1. **CDN directory structure verification:** Need to confirm the exact URL patterns for each curated machine. Some machines may use slightly different folder naming. We should fetch a few URLs to validate before hardcoding paths. If the CDN doesn't support directory listing, we'll need a mapping file that maps machine → sound → URL.
2. **Bookmarklet URL hosting:** The example site needs to host the full minified JS somewhere accessible. If the user drags the bookmarklet from the example site, the JS needs to be reachable. Alternative: inline the entire library in the bookmarklet (works but makes the bookmarklet very long — may hit URL length limits). Preferred approach: the bookmarklet dynamically creates a `<script>` tag pointing to a CDN-hosted version of the minified JS.
3. **AudioContext autoplay policy:** Need a user gesture to create the AudioContext. The play button provides this naturally. Should show a "Click to start" message if the user presses play before the context is ready.

---

## Sound Type Color Reference (for highlights)

| Sound | Color                        | Hex      |
|-------|------------------------------|----------|
| `bd`  | Red / Kick                   | `#FF5050`|
| `sd`  | Amber / Snare                | `#FFC832`|
| `hh`  | Cyan / Hi-hat                | `#64C8FF`|
| `oh`  | Sky / Open Hi-hat            | `#50A0FF`|
| `cr`  | Yellow / Crash               | `#FFFF64`|
| `rd`  | Purple / Ride                | `#C896FF`|
| `cp`  | Pink / Clap                  | `#FF96C8`|
| `rim` | Orange / Rim                 | `#FFB464`|
| `tom` | Green / Tom (ht, mt, lt)     | `#64FF96`|
| `perc`| Mint / Percussion            | `#64FFC8`|
| other | Gray / Fallback              | `#C8C8C8`|
