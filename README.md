# Blauw Audio Player

A minimal, embeddable HTML5 audio player. No dependencies, no tracking, no branding clutter.

Designed for archives, museums, podcasts, and editorial sites. Supports single tracks and albums. Works on any website.

![Screenshot placeholder — add a real screenshot once deployed](https://via.placeholder.com/480x140/ffffff/1a1a1a?text=Blauw+Audio+Player)

## Quick start

Add to your `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/BlauwFilms/blauw-audio-player@v1/dist/blauw-audio-player.min.css">
<script src="https://cdn.jsdelivr.net/gh/BlauwFilms/blauw-audio-player@v1/dist/blauw-audio-player.min.js" defer></script>
```

Then anywhere on your page, drop in a single track:

```html
<div class="blauw-audio-player"
     data-src="https://example.com/track.mp3"
     data-title="Track Title"
     data-cover="https://example.com/cover.jpg"></div>
```

Or an album:

```html
<div class="blauw-audio-player"
     data-album="Album Name"
     data-cover="https://example.com/cover.jpg"
     data-tracks='[
       {"src":"https://example.com/01.mp3","title":"Opening"},
       {"src":"https://example.com/02.mp3","title":"Interlude"},
       {"src":"https://example.com/03.mp3","title":"Closing"}
     ]'></div>
```

That's it. The script auto-detects every `.blauw-audio-player` element on the page and turns it into a working audio player.

## Features

- **Single tracks or albums** — one component handles both
- **Auto-advance** — albums play through automatically
- **Keyboard accessible** — full focus states and ARIA labels
- **Responsive** — adapts gracefully to narrow containers
- **Theme via CSS variables** — see [theming](#theming) below
- **No dependencies** — vanilla JavaScript, ~9 KB minified
- **No tracking** — nothing is sent anywhere except the audio file requests
- **MIT licensed**

## Theming

Override these CSS variables to match your site's design:

```css
:root {
  --bap-primary:    #1451eb;  /* Play button, progress bar */
  --bap-background: #ffffff;  /* Player background */
  --bap-text:       #1a1a1a;  /* Title and time text */
  --bap-accent:     #112347;  /* Hover states */
  --bap-radius:     2px;      /* Corner radius (try 8px for rounded) */
}
```

Set them on `:root` for site-wide theming, or on a parent element / individual `.blauw-audio-player` for per-instance theming.

### Built-in palettes

```css
/* Dark */
:root {
  --bap-primary: #3b82f6;
  --bap-background: #1a1a1a;
  --bap-text: #f5f5f5;
  --bap-accent: #60a5fa;
}

/* Minimal */
:root {
  --bap-primary: #333333;
  --bap-background: #fafafa;
  --bap-text: #1a1a1a;
  --bap-accent: #666666;
}
```

## API

### Embed attributes

| Attribute | Required | Description |
|---|---|---|
| `data-src` | Single track | URL of the audio file |
| `data-title` | Optional | Track title (defaults to "Untitled") |
| `data-tracks` | Album | JSON array of `{src, title}` objects |
| `data-album` | Optional | Album/playlist name (shown above title in album mode) |
| `data-cover` | Optional | URL of cover image (square recommended) |

### JavaScript API

For dynamically inserted content (e.g. tabs, modals, AJAX-loaded sections), call:

```js
window.BlauwAudioPlayer.init();
```

This re-scans the page and initializes any new `.blauw-audio-player` elements. Already-initialized players are skipped.

## Webflow setup

1. Go to **Project Settings → Custom code → Head code**
2. Paste the two `<link>` and `<script>` tags from [Quick start](#quick-start)
3. Save and publish
4. On any page, add a Code Embed block with your `<div class="blauw-audio-player">` snippet

For repeating embeds in CMS collections, use a Code Embed inside the collection item template and bind the `data-*` attributes to your CMS fields.

### Embed code generator

This repo includes a small internal tool at [`tools/embed-generator.html`](tools/embed-generator.html) — paste it into a Webflow page (or open it locally) to generate embed snippets without writing them by hand.

## Browser support

Modern browsers (Chrome, Firefox, Safari, Edge — last two major versions). Uses standard HTML5 audio APIs and ES5+ JavaScript. No build step required.

## File structure

```
.
├── src/                          # Editable source
│   ├── blauw-audio-player.css
│   └── blauw-audio-player.js
├── dist/                         # Production-ready files (served via jsDelivr)
│   ├── blauw-audio-player.css
│   ├── blauw-audio-player.js
│   ├── blauw-audio-player.min.css
│   └── blauw-audio-player.min.js
├── tools/
│   └── embed-generator.html      # Internal embed code generator
├── examples/
│   └── index.html                # Live demo of single + album modes
└── docs/
    └── HOSTING.md                # Notes on hosting audio (Cloudflare R2, etc.)
```

## Development

There's no build pipeline — `dist/` is just the source, plus minified copies. To update:

1. Edit files in `src/`
2. Run the minifier (or copy by hand for small changes)
3. Commit, push, tag a new release

When tagged with a version like `v1.0.1`, jsDelivr automatically serves the new version at `@v1.0.1`. Sites using `@v1` get the latest v1.x release automatically.

## License

MIT — see [LICENSE](LICENSE).

Built by [Blauw Films](https://www.blauwfilms.com).
