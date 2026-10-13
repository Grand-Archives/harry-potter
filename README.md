# The Wizarding World of Harry Potter

[![Deploy Pages](https://github.com/Grand-Archives/harry-potter/actions/workflows/pages.yml/badge.svg)](https://github.com/Grand-Archives/harry-potter/actions/workflows/pages.yml)

A bilingual guide to the whole wizarding world: the Hogwarts houses and founders, a timeline, creatures, magic, Quidditch and everything the author added beyond the seven books.

| Language | Live site |
| --- | --- |
| Português (Brasil) | <https://grand-archives.github.io/harry-potter/> |
| English | <https://grand-archives.github.io/harry-potter/en/> |

Part of the [GrandArchives](https://github.com/Grand-Archives) organization. This is an unofficial fan project; see the [disclaimer](#disclaimer).

## About

The guide covers the entire universe, not just the story of the seven books: the founders and houses, creatures, magic, Quidditch, a thousand years of history and what the author later added in textbooks, on her official website, in interviews, on stage and in cinema.

## Features

- **Hogwarts crest**: a quartered crest opens the page; each quarter opens a house and its founder.
- **Timeline**: events organized in six periods.
- **Profile explorer**: creatures, magic, characters, places and society, with accent-insensitive search, linked names and the connections between profiles.
- **Quidditch**: an interactive pitch with the positions and six tabs on the sport.
- **Works**: the books, textbooks, play and films the guide draws from.
- **Canon labels**: material from outside the seven books (the play, the films, interviews) is kept apart in each profile and tagged with its source, because fans disagree on what counts as canon.
- **Reader dialog** and deep links (`#tempo`, `#explorar`, ...) that survive a language switch.
- **Two languages** (Portuguese and English) with a language selector that keeps the current hash and query string.

## Naming

The English version uses the original British names and terms (Gryffindor, Slytherin, Muggle, Quidditch, *Philosopher's Stone*). The Portuguese version follows the Brazilian translation published by Rocco (Grifinória, Sonserina, trouxa, quadribol); where the original name helps readers find a creature or term, it is shown beside it.

## Tech stack

Plain HTML, CSS and JavaScript. No framework, no build step and no dependencies. Images are limited to the Hogwarts crest and the four house shields, stored as WebP files under `site/assets/img/`. The only external request is the Google Fonts stylesheet (Libre Caslon, Public Sans and IBM Plex Mono).

## Project structure

```text
.
├── CLAUDE.md                     # contributor/agent guide (architecture and rules)
├── README.md
├── .github/workflows/pages.yml   # deploys the site/ folder to GitHub Pages
└── site/                         # everything that gets published
    ├── index.html                # Portuguese page (site root)
    ├── en/index.html             # English page
    ├── sitemap.xml               # all language URLs with hreflang alternates
    ├── assets/
    │   ├── icons/                # favicon.ico, favicon.svg, apple-touch-icon.png
    │   └── img/                  # Hogwarts crest and house shields (WebP)
    ├── css/style.css             # all styles (language-independent)
    ├── js/app.js                 # shared i18n core + page logic (no visible text)
    └── i18n/
        ├── languages.json        # languages offered by the selector
        ├── pt-BR/{ui.json,data.js}
        └── en/{ui.json,data.js}
```

Each language page is a thin HTML shell. `js/app.js` reads `<html lang>`, loads `i18n/<lang>/ui.json` (interface strings) and `i18n/<lang>/data.js` (profiles, eras, Quidditch, works and sources), builds the page and renders the language selector.

House ids, profile types, Quidditch item ids and source keys are shared constants between `app.js` and every `data.js`; a new language must reuse the same ids (see [`CLAUDE.md`](CLAUDE.md)).

## Running locally

The site loads JSON and ES modules with `fetch`/`import()`, so it must be served over HTTP; opening `index.html` through `file://` does not work.

```bash
cd site
python -m http.server 8000
# or: npx serve .
```

Then open <http://localhost:8000/> and <http://localhost:8000/en/>.

## Adding a language

`js/app.js` does not need to change.

1. Create `site/i18n/<code>/ui.json` (same keys as `pt-BR/ui.json`, including `lang.label`, the credits and the rights notice) and `site/i18n/<code>/data.js` (same structure and ids as `pt-BR/data.js`; only the text changes).
2. Add `{ "code": "<code>", "name": "<Native name>", "path": "<code>/" }` to `site/i18n/languages.json`.
3. Create `site/<code>/index.html` from the head template in [`CLAUDE.md`](CLAUDE.md): correct `lang`, title, description, Open Graph tags, canonical URL and `../` relative paths.
4. Add the new `hreflang` alternate to the `<head>` of every existing language page, and the new URL (with alternates) to `site/sitemap.xml`.
5. Serve the site and check: no console errors, favicons load, the selector lists the new language and switching keeps the hash and query.

Credits and the unofficial-fan-project notice are mandatory in every language.

## Known limitations

- The four house shield images carry the house names in Portuguese on their banner (Grifinória, Sonserina, Lufa-Lufa, Corvinal), so they also appear in Portuguese on the English page. Language-specific shields are planned.

## Deployment

Every push to `master` runs `.github/workflows/pages.yml`, which uploads `site/` as the GitHub Pages artifact and deploys it. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Contributing

Corrections to facts, links and translations are welcome through issues and pull requests.

- Branch: `master`.
- Commits are written in English and follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`...).
- Keep the project dependency-free and free of build steps.
- Do not edit the i18n core block at the top of `js/app.js` here; it is shared verbatim across all GrandArchives sites.

## Sources and credits

The base material is J.K. Rowling's seven books, the three Hogwarts textbooks, her texts on the official website, interviews, the stage play and the *Fantastic Beasts* screenplays. Dates and details were checked against the Harry Potter Wiki and Wikipedia; the full list of consulted pages is in the site's footer.

The illustrations of the Hogwarts crest and the four house animals were provided by the author of the guide. The house shields were assembled for this guide in their traditional format: shield, diamond-pattern field, the animal and a banner with the house name, lettered in Pirata One (SIL Open Font License). They are not the official artwork. The texts of this guide are original.

## Disclaimer

This is an unofficial, free, non-profit fan project. It is not affiliated with or endorsed by J.K. Rowling, Warner Bros., Wizarding World Digital or any publisher. The works, names, characters and places mentioned belong to J.K. Rowling and their respective rights holders. No excerpts of the works are reproduced; the texts are summaries and commentary for reference purposes.

## Copyright

Copyright © 2026 GrandArchives. Texts, organization and design of this guide.
