# CLAUDE.md

**Always respond to the user in Brazilian Portuguese (pt-BR)**, regardless of the language of the conversation, an issue/PR or any file being discussed. Everything written into the repository (code, comments, commits, this file) is in English, except the site's own content, which is Portuguese in `site/i18n/pt-BR/`.

## What this is

Static guide to the Harry Potter wizarding world, published on GitHub Pages at `https://grandarchives.github.io/harry-potter/` (GrandArchives org). Plain HTML/CSS/JS: no framework, no build step, no dependencies. The whole `site/` folder is what gets published (`.github/workflows/pages.yml` uploads `site` as the Pages artifact on every push to `master`).

## Folder structure

```
site/
  index.html                  pt-BR page (site root; keeps the published URL)
  sitemap.xml                 every language URL, with xhtml:link hreflang alternates
  assets/icons/               favicon.ico, favicon.svg, apple-touch-icon.png
  assets/img/                 crest and house shields (.webp), language-independent
  css/style.css               all styles
  js/app.js                   i18n core (verbatim, shared by all GrandArchives sites) + page logic; NO user-visible text
  i18n/languages.json         [{ "code", "name", "path" }] used by the language selector
  i18n/pt-BR/ui.json          UI strings (flat "section.key": "text"; values may hold trusted inline HTML)
  i18n/pt-BR/data.js          content as `export default { E, ERAS, QITEMS, QTABS, OBRAS, SRC, START }`
  <code>/index.html           future language pages (e.g. site/en/index.html), data in site/i18n/<code>/
```

How a page works: `<html lang="...">` is the language code and the folder name under `site/i18n/`. `js/app.js` (classic `defer` script) loads `ui.json`, `data.js` and `languages.json`, injects the body skeleton into `<div id="app">`, fills every `data-i18n` / `data-i18n-attr` element, renders the language selector into `#langbar`, then runs the page logic. The selector renders nothing while only one language exists.

Conventions in `app.js`: house ids (`grifinoria`, `sonserina`, `lufalufa`, `corvinal`), profile types (`criatura`, `magia`, `figura`, `lugar`, `mundo`), pitch item ids (`aros`, `goleiro`, ...) and source keys (`lt`, `site`, `ent`, `peca`, `af`) are fixed, language-independent keys, because they are tied to image polygons and pitch geometry. Every `data.js` must reuse the same ids. Content ids, years, relations and source links belong in `data.js`; non-text presentation constants (colors, geometry, layout) stay in `app.js`.

The images contain baked-in text (the four house shields carry the house name in Portuguese on the banner; the Hogwarts crest carries the Latin motto). They are shared by all languages; localized shields would need a per-language image set.

## How to add a language

1. Create `site/i18n/<code>/ui.json` with exactly the keys of `site/i18n/pt-BR/ui.json` (including `lang.label`, the credits and the footer notice; plural keys `.one` / `.other`; placeholders as `{name}`).
2. Create `site/i18n/<code>/data.js` with the same structure and ids as `pt-BR/data.js`, translated.
3. Add an entry to `site/i18n/languages.json`, e.g. `{ "code": "en", "name": "English", "path": "en/" }`.
4. Create `site/<code>/index.html` from the head template below, with the correct `lang`, title, description, Open Graph, canonical, hreflang and `../` relative paths.
5. Add the new `hreflang` alternate (absolute URL) to the `<head>` of EVERY existing language page, and add the new URL plus all `xhtml:link` alternates (every language and `x-default`) to `site/sitemap.xml`.
6. `app.js` must not need any edit. Test through a static server (never `file://`): no console errors, selector visible on all pages, switching keeps hash/query.

pt-BR is the primary language and stays at the root URL. There is no automatic browser-language redirect and no language memory; do not add them.

### Head template (`site/<code>/index.html`)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>... | GrandArchives</title>
<meta name="description" content="...">
<link rel="canonical" href="https://grandarchives.github.io/harry-potter/en/">
<link rel="alternate" hreflang="pt-BR" href="https://grandarchives.github.io/harry-potter/">
<link rel="alternate" hreflang="en" href="https://grandarchives.github.io/harry-potter/en/">
<link rel="alternate" hreflang="x-default" href="https://grandarchives.github.io/harry-potter/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GrandArchives">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="pt_BR">
<meta property="og:title" content="... | GrandArchives">
<meta property="og:description" content="...">
<meta property="og:url" content="https://grandarchives.github.io/harry-potter/en/">
<link rel="icon" href="../assets/icons/favicon.ico" sizes="any">
<link rel="icon" href="../assets/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital@0;1&family=Public+Sans:ital,wght@0,400;0,500;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="../css/style.css">
<script src="../js/app.js" defer></script>
</head>
<body>
<div id="app"></div>
<noscript>JavaScript is required (message in the page language).</noscript>
</body>
</html>
```

The pt-BR root page uses the same template with `lang="pt-BR"`, `og:locale` `pt_BR`, `og:locale:alternate` `en_US` once English exists, and paths without `../`. Use relative paths only (no leading `/`) so pages work at `/harry-potter/` in production and at `/` locally.

## Rules

- Credits (sources, licences such as the font's SIL OFL, image provenance) and the unofficial-fan-project / rights notice are mandatory in every language, in `ui.json`.
- Visible text, `aria-label`/`title`/`alt`, placeholders, SVG text and counters come from `ui.json` or `data.js`; never hardcode prose in `app.js`. Locale-sensitive code uses `I18N.LANG`.
- The i18n core at the top of `js/app.js` is identical across all GrandArchives sites; do not edit it here. Report problems instead.
- Commits are written in English, following Conventional Commits (`feat:`, `fix:`, `refactor:`, ...), on branch `master`. Never add AI-attribution trailers (`Co-Authored-By`, `Claude-Session`, "Generated with ...") to commits or PRs.
- Test only through a static server, never `file://` (the page uses `fetch` and dynamic `import()`).
