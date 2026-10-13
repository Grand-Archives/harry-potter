/* ===== i18n core: identical in every GrandArchives site. Contains NO visible text. =====
 * Paste at the very top of site/js/app.js (inside the same classic <script defer> file).
 *
 * Contract
 *  - Each page declares its language in <html lang="...">; that value is the folder name under site/i18n/.
 *  - UI strings:  site/i18n/<lang>/ui.json   (flat object: "section.key": "text", may contain trusted inline HTML)
 *  - Content:     site/i18n/<lang>/data.js   (ES module, `export default {...}`)
 *  - Languages:   site/i18n/languages.json   ([{ "code": "pt-BR", "name": "Português", "path": "" }, { "code": "en", "name": "English", "path": "en/" }])
 *                 `path` is relative to the site root; "" is the Portuguese root page.
 *  - Markup:      data-i18n="key"              -> element.innerHTML = t(key)
 *                 data-i18n-attr="attr:key;attr2:key2"  -> element.setAttribute(attr, t(key))
 *  - Placeholders: "{name}" in a string is replaced from the vars object passed to t().
 *  - Plurals:     tn("key", n) uses "key.one" / "key.other" (Intl.PluralRules for the page language).
 */
const I18N = (() => {
  const ROOT = new URL('../', document.currentScript.src); // site root (this file lives in site/js/)
  const LANG = document.documentElement.lang;
  let ui = {};

  const t = (key, vars) => {
    const s = ui[key];
    if (s == null) { console.error('[i18n] missing key:', key); return key; }
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')) : s;
  };
  const tn = (key, n, vars) => t(`${key}.${new Intl.PluralRules(LANG).select(n)}`, { n, ...vars });

  const apply = (scope = document) => {
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  };

  // Renders a <select> of all languages into `container` (also with a single language);
  // keeps the current hash/search so the equivalent view opens in the other language.
  const languageSwitcher = (languages, container) => {
    if (!container) return;
    const sel = document.createElement('select');
    sel.className = 'langsel';
    sel.setAttribute('aria-label', t('lang.label'));
    languages.forEach(l => {
      const o = document.createElement('option');
      o.value = l.code; o.textContent = l.name; o.selected = l.code === LANG;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => {
      const target = languages.find(l => l.code === sel.value);
      if (target) location.href = new URL(target.path, ROOT).href + location.search + location.hash;
    });
    container.appendChild(sel);
  };

  // Loads ui.json, data.js and languages.json for the page language. Returns { data, languages }.
  const load = async () => {
    const base = new URL(`i18n/${LANG}/`, ROOT);
    const [uiRes, mod, langRes] = await Promise.all([
      fetch(new URL('ui.json', base)),
      import(new URL('data.js', base).href),
      fetch(new URL('i18n/languages.json', ROOT)),
    ]);
    ui = await uiRes.json();
    return { data: mod.default, languages: await langRes.json() };
  };

  return { ROOT, LANG, t, tn, apply, languageSwitcher, load, asset: p => new URL(`assets/${p}`, ROOT).href };
})();
/* ===== end i18n core ===== */

/* ===== Harry Potter guide: page logic. Contains NO user-visible text: strings come from i18n/<lang>/ui.json, content from i18n/<lang>/data.js. ===== */

// Page skeleton. Every element with text carries data-i18n / data-i18n-attr; I18N.apply() fills it from ui.json.
const SKELETON = `
<div class="wrap">
  <div class="langbar" id="langbar"></div>
  <nav class="nav" data-i18n-attr="aria-label:nav.label">
    <a href="#casas" data-i18n="nav.houses"></a><a href="#tempo" data-i18n="nav.timeline"></a><a href="#explorar" data-i18n="nav.explore"></a><a href="#quadribol" data-i18n="nav.quidditch"></a><a href="#obras" data-i18n="nav.works"></a><a href="#creditos" data-i18n="nav.sources"></a>
  </nav>
  <div class="top">
    <span class="eyebrow" data-i18n="hero.eyebrow"></span>
    <h1 data-i18n="hero.title"></h1>
    <p class="lede" data-i18n="hero.lede"></p>
    <span class="meta" id="meta"></span>
  </div>

  <div class="sech" id="casas"><h2 class="sec" data-i18n="houses.title"></h2><p data-i18n="houses.intro"></p></div>
  <div class="mapgrid">
    <section class="mapbox" data-i18n-attr="aria-label:crest.section">
      <svg id="crest" viewBox="0 0 1017 1054" role="group" data-i18n-attr="aria-label:crest.aria"></svg>
      <p class="mottot" data-i18n="crest.motto"></p>
      <div class="hbtns" id="hbtns"></div>
      <p class="cnote" data-i18n="crest.note"></p>
    </section>
    <aside class="mappanel" id="housepanel" aria-live="polite"></aside>
  </div>

  <div class="sech" id="tempo"><h2 class="sec" data-i18n="timeline.title"></h2><p data-i18n="timeline.intro"></p></div>
  <div class="ruler" id="ruler" role="tablist" data-i18n-attr="aria-label:timeline.periods"></div>
  <section class="era" id="era" aria-live="polite"></section>

  <div class="sech" id="explorar"><h2 class="sec" data-i18n="explore.title"></h2><p data-i18n="explore.intro"></p>
    <div class="srclgd" id="srclgd"></div></div>
  <div class="grid">
    <aside class="pick" data-i18n-attr="aria-label:explore.pick">
      <div class="tabs" role="tablist" id="tabs"></div>
      <input id="q" type="search" data-i18n-attr="placeholder:explore.search;aria-label:explore.searchLabel">
      <div class="list" id="list"></div>
    </aside>
    <section class="detail" id="detail" aria-live="polite"></section>
  </div>

  <div class="sech" id="quadribol"><h2 class="sec" data-i18n="quidditch.title"></h2><p data-i18n="quidditch.intro"></p></div>
  <div class="mapgrid wide">
    <section class="mapbox" data-i18n-attr="aria-label:quidditch.field">
      <div class="scroll"><svg id="pitch" viewBox="0 0 940 410" role="group" data-i18n-attr="aria-label:quidditch.fieldAria"></svg></div>
    </section>
    <aside class="mappanel k-magia" id="qpanel" aria-live="polite"></aside>
  </div>
  <div class="qtabs" id="qtabs" role="tablist" data-i18n-attr="aria-label:quidditch.themes"></div>
  <section class="qbody" id="qbody" aria-live="polite"></section>

  <div class="sech" id="obras"><h2 class="sec" data-i18n="works.title"></h2><p data-i18n="works.intro"></p></div>
  <div class="shelf" id="shelf"></div>

  <dialog id="reader" data-i18n-attr="aria-label:reader.label">
    <div class="rbar"><button class="btn" id="rclose" data-i18n="reader.close"></button></div>
    <div id="rbody"></div>
  </dialog>

  <section class="credits" id="creditos" data-i18n-attr="aria-label:credits.label">
    <div><h4 data-i18n="credits.sources.title"></h4><p data-i18n="credits.sources.text"></p></div>
    <div><h4 data-i18n="credits.names.title"></h4><p data-i18n="credits.names.text"></p></div>
    <div><h4 data-i18n="credits.crests.title"></h4><p data-i18n="credits.crests.text"></p></div>
    <div><h4 data-i18n="credits.canon.title"></h4><p data-i18n="credits.canon.text"></p></div>
    <details><summary data-i18n="credits.pages"></summary><ul id="srclist"></ul></details>
  </section>
  <footer class="foot">
    <p data-i18n="footer.copy"></p>
    <p data-i18n="footer.notice"></p>
  </footer>
</div>`;

// Language-independent images (they are the same in every language).
const IMG = {
  brasao: I18N.asset("img/brasao.webp"), leao: I18N.asset("img/leao.webp"), serpente: I18N.asset("img/serpente.webp"),
  texugo: I18N.asset("img/texugo.webp"), corvo: I18N.asset("img/corvo.webp"), w: 1017, h: 1054,
};
// Clickable area of each quarter, in the coordinates of the crest image: house id -> [shield image, polygon points].
// The house ids (and the pitch item ids below) are fixed keys: every language's data.js must use the same ones.
const IMG_QUART = {
  grifinoria: ["leao", "200,80 495,170 495,415 235,415"],
  sonserina: ["serpente", "520,170 815,80 780,415 520,415"],
  lufalufa: ["texugo", "140,445 495,445 495,860 290,740 135,590"],
  corvinal: ["corvo", "522,445 880,445 885,590 730,740 522,860"],
};
const CASAS = Object.keys(IMG_QUART);
const TABS = ["criatura", "magia", "figura", "lugar", "mundo"]; // profile types shown as tabs (labels: ui.json tab.<type>)
const SRC_KEYS = ["lt", "site", "ent", "peca", "af"]; // source labels (ui.json src.<key> / srcdesc.<key>)

const $ = s => document.querySelector(s);

function main({ data, languages }) {
  const { t, tn } = I18N;
  const { E, ERAS, QITEMS, QTABS, OBRAS, SRC, START } = data;

  document.getElementById("app").innerHTML = SKELETON;
  I18N.apply();
  I18N.languageSwitcher(languages, $("#langbar"));

  const brasaoSVG = nomes => {
    let h = `<image href="${IMG.brasao}" width="${IMG.w}" height="${IMG.h}"/>`;
    for (const id in IMG_QUART) h += `<polygon class="qtr" data-house="${id}" tabindex="0" role="button" aria-label="${nomes[id]}" points="${IMG_QUART[id][1]}"/>`;
    return h;
  };
  const escudoCasa = id => `<img class="emb" src="${IMG[IMG_QUART[id][0]]}" alt="">`;

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const link = s => s.replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (m, id, l) => E[id] ? `<button class="lk" data-go="${id}">${l}</button>` : l);
  const refs = s => [...s.matchAll(/\[\[(\w+)\|/g)].map(m => m[1]).filter(id => E[id]);
  const allText = e => e.p.join(" ") + " " + (e.x || []).map(x => x[1]).join(" ");

  // links between profiles and appearances in the timeline
  const conn = {}, evIn = {};
  for (const id in E) { conn[id] = new Set(); evIn[id] = [] }
  for (const id in E) for (const r of refs(allText(E[id]))) { if (r !== id) { conn[id].add(r); conn[r].add(id) } }
  ERAS.forEach(era => era.ev.forEach((ev, i) => { for (const r of new Set(refs(ev[2]))) evIn[r].push([era.id, i]) }));

  /* ---------- crest ---------- */
  function drawCrest() {
    $("#crest").innerHTML = brasaoSVG(Object.fromEntries(CASAS.map(c => [c, E[c].n])));
    $("#hbtns").innerHTML = CASAS.map(c => `<button class="k-${E[c].c}" data-house="${c}" aria-pressed="false" aria-label="${E[c].n}">${escudoCasa(c)}</button>`).join("");
  }
  function selHouse(id) {
    $("#crest").classList.add("sel");
    document.querySelectorAll("#crest .qtr").forEach(p => p.classList.toggle("on", p.dataset.house === id));
    document.querySelectorAll("#hbtns button").forEach(b => b.setAttribute("aria-pressed", b.dataset.house === id));
    const mp = $("#housepanel"); mp.className = "mappanel k-" + E[id].c; mp.innerHTML = entry(id);
  }

  /* ---------- profiles ---------- */
  function entry(id) {
    const e = E[id];
    let h = `<article class="ent k-${e.c}"><div class="enthead">${e.t === "casa" ? escudoCasa(id) : ""}<div><div class="kick"><span class="dot"></span>${t("entry.kick", { type: t("type." + e.t), group: e.g })}${e.mom ? ` <span class="mom" title="${t("entry.momTitle")}">${e.mom}</span>` : ""}</div><h3>${e.n}</h3><p class="sub">${e.s}</p></div></div>`;
    h += `<div class="prose">${e.p.map(p => `<p>${link(p)}</p>`).join("")}</div>`;
    if (e.br) h += `<div><h4>${e.bt || t("entry.detail")}</h4><ul class="branches">${e.br.map(b => `<li>${t("entry.branch", { label: b[0], text: b[1] })}</li>`).join("")}</ul></div>`;
    if (e.f) h += `<dl class="facts">${e.f.map(f => `<dt>${f[0]}</dt><dd>${f[1]}</dd>`).join("")}</dl>`;
    if (e.x) h += `<div><h4>${t("entry.outside")}</h4><ul class="xl">${e.x.map(x => `<li><span class="src s-${x[0]}">${t("src." + x[0])}</span><span>${link(x[1])}</span></li>`).join("")}</ul></div>`;
    const c = [...conn[id]].sort((a, b) => E[a].n.localeCompare(E[b].n, I18N.LANG));
    if (c.length) h += `<div><h4>${t("entry.links")}</h4><div class="chips">${c.map(x => `<button class="chip k-${E[x].c}" data-go="${x}"><span class="dot"></span>${E[x].n}</button>`).join("")}</div></div>`;
    if (evIn[id].length) h += `<div><h4>${t("entry.timeline")}</h4><ul class="back">${evIn[id].map(([er, i]) => { const era = ERAS.find(x => x.id === er), ev = era.ev[i]; return `<li><span class="yr">${ev[0]}</span><button class="lk" data-ev="${er}:${i}">${ev[1]}</button></li>` }).join("")}</ul></div>`;
    return h + `</article>`;
  }

  /* ---------- timeline ---------- */
  let curEra = START.era;
  function drawEra(hl) {
    const e = ERAS.find(x => x.id === curEra);
    $("#ruler").innerHTML = ERAS.map(x => `<button role="tab" class="k-${x.c}" data-era="${x.id}" aria-selected="${x.id === curEra}"><b>${x.n}</b><span>${x.r}</span></button>`).join("");
    $("#era").className = "era k-" + e.c;
    $("#era").innerHTML = `<div><div class="kick"><span class="dot"></span>${t("era.kick", { name: e.n, range: e.r })}</div><h3>${e.h}</h3></div><div class="prose"><p>${link(e.intro)}</p></div><ol class="line">${e.ev.map((v, i) => `<li class="st${v[3] ? " big" : ""}${hl === i ? " hl" : ""}" id="ev-${e.id}-${i}"><span class="yr">${v[0]}</span><div class="b"><span class="ti">${v[1]}</span><p>${link(v[2])}</p></div></li>`).join("")}</ol>`;
  }

  /* ---------- explorer ---------- */
  let tab = START.tab; const cur = { ...START.cur };
  function drawTabs() { $("#tabs").innerHTML = TABS.map(k => `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${t("tab." + k)}</button>`).join("") }
  // Search folding: lowercase for the page language and strip combining marks (so accents do not matter).
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase(I18N.LANG);
  function drawList() {
    const q = norm($("#q").value.trim()); let h = "", g = "";
    for (const id in E) {
      const e = E[id]; if (e.t !== tab) continue; if (q && !norm(e.n + " " + e.s + " " + e.g).includes(q)) continue;
      if (e.g !== g) { g = e.g; h += `<h4>${g}</h4>` }
      h += `<button class="item k-${e.c}" data-sel="${id}" aria-current="${cur[tab] === id}"><span class="dot"></span><span>${e.n}</span></button>`
    }
    $("#list").innerHTML = h || `<p class="empty">${t("explore.empty")}</p>`;
  }
  function drawDetail() { $("#detail").innerHTML = entry(cur[tab]) }
  function show(id, scroll) { tab = E[id].t; cur[tab] = id; drawTabs(); drawList(); drawDetail(); if (scroll) $("#detail").scrollIntoView({ block: "start" }) }

  /* ---------- Quidditch ---------- */
  // Pitch geometry is presentation config; every label comes from data.js (QITEMS) or ui.json.
  function drawPitch() {
    const pl = (x, y, l) => `<circle class="pl" cx="${x}" cy="${y}" r="13"/><text class="plt" x="${x}" y="${y + 4}">${l}</text>`;
    const p2 = (x, y) => `<circle class="pl2" cx="${x}" cy="${y}" r="12"/>`;
    const qi = (id, inner) => `<g class="qi" data-q="${id}" tabindex="0" role="button" aria-label="${QITEMS[id].n}">${inner}</g>`;
    const L = id => QITEMS[id].l, K = id => QITEMS[id].k;
    let h = `<ellipse class="grass" cx="450" cy="190" rx="430" ry="150"/><circle class="chalk" cx="450" cy="190" r="13"/>
<path class="chalk" stroke-dasharray="7 6" d="M165 78 Q215 190 165 302 M735 78 Q685 190 735 302"/>`;
    h += qi("aros", `<circle class="hoop" cx="78" cy="148" r="11"/><circle class="hoop" cx="66" cy="190" r="14"/><circle class="hoop" cx="78" cy="232" r="11"/><circle class="hoop" cx="822" cy="148" r="11"/><circle class="hoop" cx="834" cy="190" r="14"/><circle class="hoop" cx="822" cy="232" r="11"/><text x="52" y="282">${L("aros")}</text>`);
    h += qi("goleiro", pl(128, 190, K("goleiro")) + `<text x="112" y="222" text-anchor="start">${L("goleiro")}</text>`);
    h += qi("batedor", pl(270, 112, K("batedor")) + pl(290, 268, K("batedor")) + `<text x="290" y="117">${L("batedor")}</text>`);
    h += qi("artilheiro", pl(405, 145, K("artilheiro")) + pl(470, 232, K("artilheiro")) + pl(390, 286, K("artilheiro")) + `<text x="410" y="291">${L("artilheiro")}</text>`);
    h += qi("apanhador", pl(600, 100, K("apanhador")) + `<text x="620" y="105">${L("apanhador")}</text>`);
    h += p2(772, 190) + p2(630, 268) + p2(610, 160) + p2(520, 150) + p2(545, 290) + p2(690, 225) + p2(330, 180);
    h += qi("goles", `<circle cx="498" cy="214" r="9" fill="var(--h-grif)" stroke="var(--h-ink)" stroke-width="1.5"/><text x="512" y="219">${L("goles")}</text>`);
    h += qi("balaco", `<circle cx="352" cy="218" r="8" fill="var(--h-ink)" stroke="var(--chalk)" stroke-width="1.5"/><circle cx="705" cy="142" r="8" fill="var(--h-ink)" stroke="var(--chalk)" stroke-width="1.5"/><text x="366" y="223">${L("balaco")}</text>`);
    h += qi("pomo", `<path d="M556 66 q-12 -9 -19 0 q10 3 19 0 M564 66 q12 -9 19 0 q-10 3 -19 0" fill="var(--h-prata)" stroke="var(--h-ink)" stroke-width="1"/><circle cx="560" cy="67" r="6" fill="var(--h-ouro)" stroke="var(--h-ink)" stroke-width="1.5"/><text x="588" y="62">${L("pomo")}</text>`);
    h += `<path class="dimline" d="M20 372 V384 M880 372 V384 M20 378 H880"/><text class="dim" x="450" y="402" text-anchor="middle">${t("pitch.dimLength")}</text>
<path class="dimline" d="M898 40 H910 M898 340 H910 M904 40 V340"/><text class="dim" transform="translate(928 190) rotate(90)" text-anchor="middle">${t("pitch.dimWidth")}</text>`;
    $("#pitch").innerHTML = h;
  }
  function selQ(id) {
    document.querySelectorAll("#pitch .qi").forEach(p => p.classList.toggle("on", p.dataset.q === id));
    const q = QITEMS[id];
    $("#qpanel").innerHTML = `<article class="ent"><div><div class="kick"><span class="dot"></span>${t("quidditch.kick", { q: q.q })}</div><h3>${q.n}</h3></div><div class="prose"><p>${q.p}</p></div></article>`;
  }
  let qtab = START.qtab;
  function drawQ() {
    $("#qtabs").innerHTML = QTABS.map(x => `<button role="tab" data-qtab="${x[0]}" aria-selected="${x[0] === qtab}">${x[1]}</button>`).join("");
    $("#qbody").innerHTML = QTABS.find(x => x[0] === qtab)[2];
  }

  /* ---------- works and sources ---------- */
  $("#shelf").innerHTML = OBRAS.map(g => `<section class="k-${g.k}"><div class="shelfh"><h3>${g.h}</h3><p>${g.d}</p></div><div class="books">${g.b.map(b => `<article class="book"><span class="y">${b[0]}</span><div><h4>${b[1]}</h4>${b[2] ? `<span class="o">${b[2]}</span>` : ""}</div><span class="era-tag">${b[3]}</span><p>${b[4]}</p></article>`).join("")}</div></section>`).join("");
  $("#srclist").innerHTML = SRC.map(s => `<li><a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a></li>`).join("");
  $("#srclgd").innerHTML = SRC_KEYS.map(k => `<span><span class="src s-${k}">${t("src." + k)}</span>${t("srcdesc." + k)}</span>`).join("");

  /* ---------- events ---------- */
  const reader = $("#reader");
  function openReader(id) { $("#rbody").className = "k-" + E[id].c; $("#rbody").innerHTML = entry(id); if (!reader.open) reader.showModal(); reader.scrollTop = 0 }
  $("#rclose").onclick = () => reader.close();
  reader.addEventListener("click", e => { if (e.target === reader) reader.close() });
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-go],[data-ev],[data-house],[data-era],[data-tab],[data-sel],[data-q],[data-qtab]"); if (!el) return;
    const d = el.dataset;
    if (d.go) openReader(d.go);
    else if (d.ev) { const [er, i] = d.ev.split(":"); if (reader.open) reader.close(); curEra = er; drawEra(+i); document.getElementById(`ev-${er}-${i}`).scrollIntoView({ block: "center" }) }
    else if (d.house) selHouse(d.house);
    else if (d.era) { curEra = d.era; drawEra() }
    else if (d.tab) { tab = d.tab; $("#q").value = ""; drawTabs(); drawList(); drawDetail() }
    else if (d.sel) show(d.sel, window.matchMedia("(max-width:860px)").matches);
    else if (d.q) selQ(d.q);
    else if (d.qtab) { qtab = d.qtab; drawQ() }
  });
  document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("#crest .qtr,#pitch .qi")) { e.preventDefault(); e.target.dataset.house ? selHouse(e.target.dataset.house) : selQ(e.target.dataset.q) } });
  $("#q").addEventListener("input", drawList);

  const count = type => Object.values(E).filter(e => e.t === type).length;
  $("#meta").textContent = t("meta.line", {
    houses: tn("meta.houses", CASAS.length),
    events: tn("meta.events", ERAS.reduce((a, e) => a + e.ev.length, 0)),
    creatures: tn("meta.creatures", count("criatura")),
    magic: tn("meta.magic", count("magia")),
    figures: tn("meta.figures", count("figura")),
    places: tn("meta.places", count("lugar")),
    society: tn("meta.society", count("mundo")),
  });
  drawCrest(); selHouse(START.house); drawEra(); drawTabs(); drawList(); drawDetail(); drawPitch(); selQ(START.qitem); drawQ();

  // The skeleton did not exist when the browser first tried to honour #hash: scroll there now.
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "instant" });
}

I18N.load().then(main);
