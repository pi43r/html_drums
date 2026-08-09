# &#x1F941; HTML Drums

Turn any web page into a percussion instrument.

A zero-dependency vanilla JavaScript library that walks the DOM tree in time
with a configurable BPM, playing classic drum machine samples for each HTML
element. Inject it via bookmarklet, console, or `<script>` tag.

**[Demo →](example/index.html)**

## Quick Start

### Bookmarklet (recommended)

1. Open [`example/index.html`](example/index.html)
2. Drag the **"&#x1F941; HTML Drums"** link to your bookmarks bar
3. Navigate to any web page
4. Click the bookmark — the control panel appears in the top-right

### Console

```js
var s = document.createElement('script');
s.src = 'html-drums.js';
document.head.appendChild(s);
```

### Script tag

```html
<script src="html-drums.js"></script>
```

## Features

- **10 iconic drum machines** — TR-808, TR-909, TR-707, TR-606, LinnDrum, DMX, SP-12, MPC-60, SDS-5, CR-78
- **DOM traversal** — each HTML element becomes a drum hit, from `<body>` down
- **Configurable BPM** — 30–300, default 120
- **Tag → sound mapping** — `<h1>` = crash, `<p>` = hi-hat, `<a>` = rim shot, etc.
- **Visual highlight** — each element scales up and flashes with a sound-coded color
- **Choke groups** — closed hi-hat cuts open hi-hat
- **Volume control**
- **Settings persist** via localStorage
- **Zero dependencies** — no jQuery, no frameworks, no build step

## Sound Sources

All samples are streamed from the [Strudel CDN](https://strudel.b-cdn.net):

```
https://strudel.b-cdn.net/tidal-drum-machines/machines/
```



## License

MIT
