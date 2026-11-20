/* SheLedTheWay — The Daily Desk
   Interactive prototype. No build step, no dependencies. */

(() => {
  "use strict";

  const D = window.SLW;
  const app = document.getElementById("app");
  const overlayRoot = document.getElementById("overlay-root");
  const toastRegion = document.getElementById("toast-region");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    screen: "desk",
    date: D.focus,
    tab: "cut",
    scene: 0,
    openScene: null,
    playTime: 0,
    playing: false,
    autoPlay: false,
    safe: true,
    approved: new Set(),
    changes: new Set(),
    calDate: D.today,
    calMonth: "2026-11",
    calView: "run",
    calStart: "2026-11-16",
    weekAutoScroll: true,
    filter: "all",
    ruleStage: "draft",
    paletteOpen: false,
    paletteQuery: "",
    paletteIndex: 0,
    overlay: null,
    lastFocus: null,
    captionEditing: false,
    captionDraft: null,
    captions: {},
  };

  let playTimer = null;
  let toastTimer = null;

  /* ------------------------------------------------------------
     icons
     ------------------------------------------------------------ */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.5 4.5"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.4"/><path d="m8.4 12.4 2.5 2.5 4.7-5"/>',
    circle: '<circle cx="12" cy="12" r="8.4"/>',
    alert: '<path d="M12 4 2.8 20h18.4L12 4Z"/><path d="M12 9.2v5"/><path d="M12 17.4v.1"/>',
    xCircle: '<circle cx="12" cy="12" r="8.4"/><path d="m9 9 6 6M15 9l-6 6"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.5V12l3 2"/>',
    play: '<path d="M8.5 5.6v12.8L19 12 8.5 5.6Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8.2 5.4h3.1v13.2H8.2zM12.7 5.4h3.1v13.2h-3.1z" fill="currentColor" stroke="none"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.1 6.6"/><path d="M20 5v6h-6"/>',
    more: '<circle cx="5" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.15" fill="currentColor" stroke="none"/>',
    chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
    chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
    arrowRight: '<path d="M4 12h15"/><path d="m14 7 5 5-5 5"/>',
    arrowLeft: '<path d="M20 12H5"/><path d="m10 7-5 5 5 5"/>',
    external: '<path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M19 14v5H5V5h5"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="1"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    desk: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 10h16M10 10v10"/>',
    runs: '<path d="M4 17.5 9 12l3.2 3.2L20 7"/><path d="M4 20h16"/>',
    rules: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.9" r=".9" fill="currentColor" stroke="none"/>',
    link: '<path d="M10 13.8a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10.2a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 0 0 5.7 5.7l1-1"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.2 2.2M15.8 15.8 18 18M18 6l-2.2 2.2M8.2 15.8 6 18"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  };
  function icon(name, cls = "") {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }

  /* ------------------------------------------------------------
     utilities
     ------------------------------------------------------------ */
  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const pad2 = (n) => String(n).padStart(2, "0");
  const parse = (date) => new Date(date + "T12:00:00Z");
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function fmtDate(date, opts = {}) {
    const d = parse(date);
    const dow = DOW[(d.getUTCDay() + 6) % 7];
    if (opts.long) return `${dow} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    return `${dow} ${d.getUTCDate()} ${MONTHS_S[d.getUTCMonth()]}`;
  }
  function monthLabel(month) {
    const [y, m] = month.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  }
  function addMonths(month, delta) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
  }
  function weekOf(date) {
    const d = parse(date);
    const offset = (d.getUTCDay() + 6) % 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - offset);
    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(monday);
      x.setUTCDate(monday.getUTCDate() + i);
      return `${x.getUTCFullYear()}-${pad2(x.getUTCMonth() + 1)}-${pad2(x.getUTCDate())}`;
    });
  }
  function addDays(date, n) {
    const d = parse(date);
    d.setUTCDate(d.getUTCDate() + n);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  function runCells(start) {
    return Array.from({ length: 35 }, (_, i) => {
      const date = addDays(start, i);
      return { date, day: parse(date).getUTCDate(), story: story(date) };
    });
  }
  function runLabel(start) {
    const a = parse(start);
    const b = parse(addDays(start, 34));
    const left = a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()}` : `${a.getUTCDate()} ${MONTHS_S[a.getUTCMonth()]}`;
    return `${left} – ${b.getUTCDate()} ${MONTHS_S[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
  }
  function weekLabel(date) {
    const week = weekOf(date);
    const a = parse(week[0]);
    const b = parse(week[6]);
    return `${a.getUTCDate()} ${MONTHS_S[a.getUTCMonth()]} – ${b.getUTCDate()} ${MONTHS_S[b.getUTCMonth()]}`;
  }
  const storyIndex = Object.fromEntries(D.stories.map((s, i) => [s.date, i]));
  const story = (date) => D.byDate[date];
  const totalDur = (s) => (s.scenes ? s.scenes.reduce((a, x) => a + x.dur, 0) : 0);
  const fmtTC = (sec) => `${pad2(Math.floor(sec / 60))}:${pad2(Math.floor(sec % 60))}`;
  function sceneAt(s, t) {
    if (!s.scenes) return 0;
    let acc = 0;
    for (let i = 0; i < s.scenes.length; i++) {
      acc += s.scenes[i].dur;
      if (t < acc) return i;
    }
    return s.scenes.length - 1;
  }
  function splitName(name) {
    const parts = name.split(" ");
    if (parts.length < 2) return name;
    const mid = Math.ceil(parts.length / 2);
    return parts.slice(0, mid).join(" ") + "\n" + parts.slice(mid).join(" ");
  }
  function firstSentence(text) {
    const m = String(text).match(/^.*?[.!?](?:\s|$)/);
    return (m ? m[0] : text).trim();
  }

  const TOPIC = {
    "2026-11-16": "NVIDIA",
    "2026-11-17": "AMD",
    "2026-11-18": "CHIP DESIGN",
    "2026-11-19": "ARM DESIGN",
    "2026-11-20": "CISCO CTO",
    "2026-11-21": "COMPILER WORK",
    "2026-11-22": "THE WEEK",
  };

  /* ------------------------------------------------------------
     status
     ------------------------------------------------------------ */
  const STATUS = {
    published: { label: "Published", mark: "done", tone: "done" },
    scheduled: { label: "Scheduled", mark: "done", tone: "done" },
    final: { label: "Final cut", mark: "attention", tone: "attention" },
    rendering: { label: "Rendering", mark: "live", tone: "live" },
    exception: { label: "Needs a fix", mark: "attention", tone: "attention" },
    failed: { label: "Render failed", mark: "fail", tone: "attention" },
    script: { label: "Script ready", mark: "idle", tone: "idle" },
    planned: { label: "Planned", mark: "idle", tone: "idle" },
  };
  function displayStatus(s) {
    if (!s) return { label: "No story", mark: "idle", tone: "idle", detail: "" };
    if (state.approved.has(s.date)) return { label: "Scheduled", mark: "done", tone: "done", detail: `${s.slot} IST · approved` };
    if (state.changes.has(s.date)) return { label: "Changes requested", mark: "attention", tone: "attention", detail: "Hermes is on it" };
    const base = STATUS[s.status] || STATUS.planned;
    return { ...base, detail: s.detail };
  }
  function nextSlot(s) {
    const late = s.date < D.today;
    return late
      ? { time: "20:30", label: "Today · 20:30 IST", undo: "20:25" }
      : { time: s.slot, label: `${fmtDate(s.date)} · ${s.slot} IST`, undo: "the slot" };
  }

  function markIcon(st) {
    const name = st.mark === "done" ? "check" : st.mark === "fail" ? "xCircle" : st.mark === "attention" ? "alert" : st.mark === "live" ? "clock" : "circle";
    return `<span class="mark ${st.mark}" aria-hidden="true">${icon(name)}</span>`;
  }
  function stamp(st) {
    return `<span class="stamp ${st.tone}">${esc(st.label)}</span>`;
  }

  /* ------------------------------------------------------------
     artwork
     ------------------------------------------------------------ */
  const CROP_SVG = `<svg class="cropmarks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4h4M4 4V0M96 0h4v4M100 96v4h-4M4 100H0v-4" fill="none" stroke="#C9A24B" stroke-width=".7" vector-effect="non-scaling-stroke" opacity=".85"/></svg>`;

  const DEFAULT_THREAD = "M-4 26 C 18 10, 36 40, 56 32 S 80 62, 104 50";

  function photoHTML(p) {
    const a = D.photos[p.key];
    if (!a) return "";
    const isBg = Boolean(p.bg) || String(p.cls || "").includes("snap-bg");
    const isPortraitBg = String(p.cls || "").includes("portrait-bg");
    const src = isPortraitBg ? a.src : (isBg ? (a.bgSrc || a.src) : a.src);
    const style = isBg ? "" : ` style="--x:${p.x || "0%"};--y:${p.y || "0%"};--w:${p.w || "30%"};--h:${p.h || "30%"};--rot:${p.rot || "0deg"}"`;
    return `<figure class="snap ${p.cls || "snap-print"}"${style}>
      <img src="${src}" alt="" loading="lazy" draggable="false" style="object-position:${p.pos || "50% 50%"}">
      ${p.cap && !isBg ? `<figcaption>${esc(p.cap)}</figcaption>` : ""}
    </figure>`;
  }

  function photoCreditText(photos) {
    return (photos || []).map((p) => D.photos[p.key]).filter(Boolean)
      .map((a) => `${a.name} — ${a.credit}, ${a.license}`).join(" · ");
  }

  function artHTML({ title, label, hook = "", topL = "", topR = "", footL = "SHELEDTHEWAY", footR = "", num = "", cls = "", photos = [], thread = DEFAULT_THREAD, credit = "" }) {
    const hasPhotos = photos.length > 0;
    const layers = hasPhotos
      ? `<div class="collage" aria-hidden="true">${photos.map(photoHTML).join("")}</div>
         <div class="collage-light" aria-hidden="true"></div>
         <div class="collage-scrim" aria-hidden="true"></div>
         <div class="halftone" aria-hidden="true"></div>
         ${thread ? `<svg class="thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
           <path class="thread-shadow" d="${thread}"></path>
           <path class="thread-line" d="${thread}"></path>
         </svg>` : ""}`
      : "";
    return `<div class="art ${cls}" ${credit ? `data-credit="${esc(credit)}"` : ""}>
      ${layers}
      ${CROP_SVG}
      <div class="art-top"><span>${esc(topL)}</span><span class="fmt">${esc(topR)}</span></div>
      ${num ? `<div class="art-num" aria-hidden="true">${esc(num)}</div>` : ""}
      <div class="art-label">${esc(label)}</div>
      <div class="art-title">${esc(title)}</div>
      ${hook ? `<div class="art-hook">${esc(hook)}</div>` : ""}
      <div class="art-foot"><span>${esc(footL)}</span><span>${esc(footR)}</span></div>
    </div>`;
  }

  function posterArt(s) {
    const topic = TOPIC[s.date] || s.format.toUpperCase();
    const photos = D.coverPhotos[s.date] || [];
    return artHTML({
      title: splitName(s.woman),
      label: `${s.pillar} · ${topic}`,
      hook: s.hook,
      topL: s.pillar,
      topR: `${s.format} · ${pad2(storyIndex[s.date] + 1)}`,
      footR: fmtDate(s.date).toUpperCase(),
      num: pad2(storyIndex[s.date] + 1),
      cls: `${s.format === "Carousel" ? "carousel " : ""}${s.woman.length > 15 ? "long " : ""}${photos.length ? "has-photo" : ""}`.trim(),
      photos,
      credit: photoCreditText(photos),
    });
  }

  function sceneArt(s, sc) {
    const tc = fmtTC(sc.start);
    const photos = sc.photos || [];
    if (sc.art === "closing") {
      return artHTML({
        title: sc.on, label: s.woman.toUpperCase(), topL: `SCENE ${pad2(sc.n)}`, topR: tc,
        footL: "SHELEDTHEWAY", footR: "SHE LED THE WAY", cls: "closing",
        photos, thread: sc.thread !== undefined ? sc.thread : DEFAULT_THREAD, credit: photoCreditText(photos),
      });
    }
    return artHTML({
      title: sc.on,
      label: s.woman.toUpperCase(),
      topL: s.pillar,
      topR: `SCENE ${pad2(sc.n)} · ${tc}`,
      footR: TOPIC[s.date] || s.format.toUpperCase(),
      num: pad2(sc.n),
      cls: sc.art || "statement",
      photos, thread: sc.thread !== undefined ? sc.thread : DEFAULT_THREAD, credit: photoCreditText(photos),
    });
  }

  function slideArt(s, i) {
    const text = s.slides[i];
    const photos = (i === 0 || i === s.slides.length - 1) ? (D.coverPhotos[s.date] || []) : [];
    return artHTML({
      title: text,
      label: `SLIDE ${pad2(i + 1)} / ${pad2(s.slides.length)}`,
      topL: s.pillar,
      topR: s.format.toUpperCase(),
      footR: s.woman.toUpperCase(),
      cls: `carousel${photos.length ? " has-photo" : ""}`,
      photos,
      credit: photoCreditText(photos),
    });
  }

  /* ------------------------------------------------------------
     shell
     ------------------------------------------------------------ */
  function topbar() {
    const active = state.screen === "studio" ? "desk" : state.screen;
    const nav = [
      ["desk", "Desk", "desk"],
      ["calendar", "Calendar", "calendar"],
      ["runs", "Runs", "runs"],
      ["rules", "Rules", "rules"],
    ];
    return `<header class="topbar">
      <a class="brand" href="#/desk" aria-label="SheLedTheWay — the desk">
        <span class="brand-name">SheLedTheWay<span class="brand-dot">.</span></span>
        <span class="brand-sub">The Daily Desk</span>
      </a>
      <nav class="nav" aria-label="Primary">
        ${nav.map(([id, label, ic]) => `<a href="#/${id}" ${active === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="top-actions">
        <span class="sync"><span class="dot"></span>Synced 2m · 190f594</span>
        <button class="search-btn" data-act="palette" aria-label="Search stories">
          ${icon("search")}<span>Search</span><kbd>⌘K</kbd>
        </button>
        <a class="btn-icon" href="https://myhermes.phoneme.in/" target="_blank" rel="noopener noreferrer" aria-label="Open the live board" style="border-color:rgba(247,241,232,.26);color:var(--ivory)">${icon("external")}</a>
      </div>
    </header>`;
  }

  function bottomNav() {
    const active = state.screen === "studio" ? "desk" : state.screen;
    const items = [
      ["desk", "Desk", "desk"],
      ["calendar", "Calendar", "calendar"],
      ["runs", "Runs", "runs"],
      ["rules", "Rules", "rules"],
    ];
    return `<nav class="bottom-nav" aria-label="Primary">
      ${items.map(([id, label, ic]) => `<a href="#/${id}" ${active === id ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></a>`).join("")}
    </nav>`;
  }

  function weekRibbon() {
    return `<div class="week-wrap"><div class="week" aria-label="The week">
      ${D.week.map((date) => {
        const s = story(date);
        if (!s) return "";
        const st = displayStatus(s);
        const selected = state.date === date;
        const today = date === D.today;
        const late = s.status === "final" && date < D.today && !state.approved.has(date) && !state.changes.has(date);
        return `<button class="week-day ${selected ? "is-selected" : ""}" data-act="select-date" data-date="${date}" aria-pressed="${selected}">
          <span class="dow-row">
            <span>${DOW[(parse(date).getUTCDay() + 6) % 7]}</span>
            <span class="dnum">${parse(date).getUTCDate()}</span>
            ${today ? '<span class="today-pill">TODAY</span>' : late ? '<span class="late-pill">LATE</span>' : ""}
          </span>
          <span class="week-name">${esc(s.woman)}</span>
          <span class="week-meta"><span class="fmt">${esc(s.format)}</span><span>${esc(s.pillar)}</span></span>
          <span class="week-state">${markIcon(st)}<span>${esc(st.label)}</span><span class="time">${esc(s.slot)}</span></span>
        </button>`;
      }).join("")}
    </div></div>`;
  }

  /* ------------------------------------------------------------
     desk
     ------------------------------------------------------------ */
  function coverAlt(s) {
    const photos = (D.coverPhotos[s.date] || []).map((p) => D.photos[p.key]).filter(Boolean);
    return photos.length
      ? `Cover for ${s.woman}. Archive photographs: ${photos.map((a) => a.alt).join("; ")}.`
      : `Cover for ${s.woman}.`;
  }

  function desk() {
    const s = story(state.date) || story(D.focus);
    const st = displayStatus(s);
    const approved = state.approved.has(s.date);
    const changed = state.changes.has(s.date);
    const needs = D.needs.filter((n) => !state.approved.has(n.date) && !state.changes.has(n.date) && (n.kind !== "fail" || story(n.date)?.status === "failed") && (n.kind !== "fix" || story(n.date)?.status === "exception"));
    return `<main id="main" class="page desk-page">
      <div class="desk-grid">
        <section class="proof" aria-labelledby="proof-name">
          <div class="poster" role="img" aria-label="${esc(coverAlt(s))}">
            ${posterArt(s)}
            ${approved ? `<div class="approved-stamp">Approved<small>19 Nov · 17:12</small></div>` : ""}
          </div>
          <div class="proof-body">
            <div class="proof-head">
              <div>
                <h1 id="proof-name">${esc(s.woman)}</h1>
                <div class="proof-meta"><span>${esc(s.pillar)}</span><span>${esc(s.format)}</span><span>${fmtDate(s.date)}</span><span>${s.scenes ? s.scenes.length + " scenes" : s.slides ? s.slides.length + " slides" : "Script"}</span></div>
              </div>
              ${stamp(st)}
            </div>
            <p class="proof-hook">${esc(s.hook)}</p>
            ${cutline(s)}
            <div class="factline">
              <span class="item">${icon("check")} Script ${s.scenes ? "96 words" : "ready"}</span>
              <span class="item">${icon("check")} Facts sourced</span>
              <span class="item">${icon("clock")} Slot ${esc(s.slot)} IST</span>
              ${s.date === "2026-11-18" ? (approved ? "" : `<span class="item late"><span class="mono">1 day over</span></span>`) : `<span class="item"><span class="mono">On schedule</span></span>`}
            </div>
            <div class="proof-actions">
              <a class="btn btn-primary" href="#/studio/${s.date}">${s.status === "final" && !approved && !changed ? "Review final cut" : approved ? "Open scheduled cut" : "Open the proof"}${icon("arrowRight")}</a>
              <button class="btn btn-ghost" data-act="play-preview">${icon("play")} Play preview</button>
              ${s.url ? `<a class="btn btn-quiet" href="${s.url}" target="_blank" rel="noopener noreferrer">On Instagram ${icon("external")}</a>` : ""}
            </div>
            ${(D.coverPhotos[s.date] || []).length ? `<a class="proof-credit" href="#/studio/${s.date}/facts">Archive photographs · credits in Facts</a>` : ""}
          </div>
        </section>

        <aside class="rail" aria-label="Decisions and machine">
          <section class="rail-block">
            <div class="rail-head"><h2>Needs you</h2><span class="count">${needs.length} ${needs.length === 1 ? "item" : "items"}</span></div>
            ${needs.length ? needs.map((n) => {
              const current = n.date === state.date;
              return `<a class="queue-item ${current ? "is-current" : ""}" href="${n.href}">
                <span class="mark ${n.kind === "fail" ? "fail" : "attention"}" aria-hidden="true">${icon(n.kind === "fail" ? "xCircle" : "alert")}</span>
                <span><span class="queue-title">${esc(n.title)}${current ? ' <span class="queue-flag">On the desk</span>' : ""}</span><span class="queue-reason">${esc(n.reason)}</span></span>
                <span class="queue-cta">${esc(n.cta)}</span>
              </a>`;
            }).join("") : `<div class="queue-empty">Nothing needs you. The next slot is Sophie Wilson at 19:30.</div>`}
          </section>
          <section class="rail-block">
            <div class="rail-head"><h2>Machine room</h2><span class="count">autopilot</span></div>
            ${machinePanel()}
          </section>
        </aside>
      </div>
      <div class="desk-foot"><span>main · 190f594 · synced 2 min ago</span><span class="proto">Prototype · repo content and credited archive images; run states illustrative</span></div>
      ${deskMobileActions(s, approved, changed)}
    </main>`;
  }

  function deskMobileActions(s, approved, changed) {
    let primary;
    if (approved) primary = `<a class="btn btn-primary" href="#/studio/${s.date}">Open scheduled cut${icon("arrowRight")}</a>`;
    else if (changed) primary = `<a class="btn btn-primary" href="#/studio/${s.date}">See the change${icon("arrowRight")}</a>`;
    else if (s.status === "final") primary = `<a class="btn btn-primary" href="#/studio/${s.date}">Review final cut${icon("arrowRight")}</a>`;
    else if (s.status === "exception") primary = `<a class="btn btn-primary" href="#/studio/${s.date}/caption">Fix the opening${icon("arrowRight")}</a>`;
    else if (s.status === "published" && s.url) primary = `<a class="btn btn-primary" href="${s.url}" target="_blank" rel="noopener noreferrer">View on Instagram${icon("external")}</a>`;
    else primary = `<a class="btn btn-primary" href="#/studio/${s.date}">Open the proof${icon("arrowRight")}</a>`;
    const secondary = s.scenes ? `<button class="btn btn-ghost" data-act="play-preview">${icon("play")} Play</button>` : "";
    return `<div class="mobile-actions desk-actions">${secondary}${primary}</div>`;
  }

  function cutline(s) {
    if (s.scenes) {
      const total = totalDur(s);
      return `<div class="cutline">
        <div class="cutlabel"><span>The cut</span><span>${s.scenes.length} scenes · ${fmtTC(total)}</span></div>
        <div class="cutbar">
          ${s.scenes.map((sc) => `<a class="cutseg ${sc.state === "updated" || sc.state === "check" ? "updated" : sc.state === "running" ? "check" : "done"}" href="#/studio/${s.date}?scene=${sc.n}" title="Scene ${sc.n}: ${esc(firstSentence(sc.vo))}">${pad2(sc.n)}</a>`).join("")}
        </div>
        <p class="cut-note">${s.date === "2026-11-18" ? "Scene 4 re-voiced at 16:42; scene 6 keyword checked. <b>All 7 scenes locked.</b>" : `<b>${esc(s.detail)}</b>`}</p>
      </div>`;
    }
    if (s.slides) {
      return `<div class="cutline">
        <div class="cutlabel"><span>Slides</span><span>${s.slides.length} slides · 1080 × 1350</span></div>
        <div class="cutbar">${s.slides.map((_, i) => `<a class="cutseg done" href="#/studio/${s.date}?slide=${i + 1}">${pad2(i + 1)}</a>`).join("")}</div>
        <p class="cut-note">Carousel · no voiceover. <b>${esc(s.detail)}</b></p>
      </div>`;
    }
    return `<div class="cutline">
      <div class="cutlabel"><span>No cut yet</span><span>${esc(s.detail)}</span></div>
      <div class="cutbar">${Array.from({ length: 7 }, (_, i) => `<span class="cutseg" style="background:var(--paper-2)">${pad2(i + 1)}</span>`).join("")}</div>
      <p class="cut-note">The plan is set. Hermes takes it from research to a final cut; you see it at the gate.</p>
    </div>`;
  }

  function machinePanel() {
    return `<div class="machine">
      <div class="machine-top"><span class="machine-title">Sophie Wilson</span><span class="machine-live"><span class="pulse"></span>Running</span></div>
      <div class="machine-stage">Render &amp; voice · scene 4 of 7</div>
      <div class="progress"><i style="width:57%"></i></div>
      <div class="machine-meta"><span>00:22 elapsed</span><span>voice next · ~2 min</span></div>
      <div class="machine-foot"><b>1 running · 2 exceptions</b> · final gate at 17:30</div>
    </div>`;
  }

  /* ------------------------------------------------------------
     studio
     ------------------------------------------------------------ */
  function hasCut(s) { return Boolean(s && (s.scenes || s.slides)); }
  function defaultTab(s) { return s.scenes ? "cut" : s.slides ? "slides" : "script"; }

  function studio() {
    const s = story(state.date);
    if (!s) {
      return `<main id="main" class="page"><div class="empty" style="margin-top:24px"><h2>No story here</h2><p>That date is not on the plan.</p><div class="actions"><a class="btn btn-primary" href="#/calendar">Open the calendar</a></div></div></main>`;
    }
    const st = displayStatus(s);
    const approved = state.approved.has(s.date);
    const changed = state.changes.has(s.date);
    const showTabs = hasCut(s) || s.status !== "planned";
    const mobileGate = hasCut(s) && !approved && !changed && (s.status === "final" || s.status === "exception" || state.captionEditing);
    const tabs = s.scenes
      ? [["cut", "The cut"], ["script", "Script"], ["caption", "Caption & search"], ["facts", "Facts"], ["history", "History"]]
      : s.slides
        ? [["slides", "Slides"], ["caption", "Caption & search"], ["facts", "Facts"], ["history", "History"]]
        : [["script", "Script"], ["caption", "Caption & search"], ["facts", "Facts"], ["history", "History"]];
    if (!tabs.some(([id]) => id === state.tab)) state.tab = defaultTab(s);
    const body = !hasCut(s) && s.status === "planned"
      ? emptyStudio(s)
      : state.tab === "cut" ? cutTab(s)
        : state.tab === "slides" ? slidesTab(s)
          : state.tab === "script" ? scriptTab(s)
            : state.tab === "caption" ? captionTab(s)
              : state.tab === "facts" ? factsTab(s)
                : historyTab(s);
    return `<main id="main" class="page ${mobileGate ? "has-mobile-gate" : ""}">
      <div class="studio-head">
        <a class="back" href="#/desk">${icon("arrowLeft")}<span>Desk</span></a>
        <div class="studio-title">
          <h1>${esc(s.woman)}</h1>
          <div class="meta"><span>${esc(s.pillar)}</span><span>${esc(s.format)}</span><span>${fmtDate(s.date, { long: true })}</span><span>${s.scenes ? s.scenes.length + " scenes · " + fmtTC(totalDur(s)) : s.slides ? s.slides.length + " slides" : "Script"}</span></div>
        </div>
        <div class="studio-status">${stamp(st)}</div>
        <div class="studio-actions">${studioActions(s, approved, changed)}</div>
      </div>
      ${showTabs ? `<div class="tabs" role="tablist" aria-label="Story views">
        ${tabs.map(([id, label]) => `<button class="tab" role="tab" aria-selected="${state.tab === id}" data-act="tab" data-tab="${id}">${label}${id === "facts" ? `<span class="mono">${factsFor(s).length}</span>` : ""}</button>`).join("")}
      </div>` : ""}
      ${body}
      ${hasCut(s) ? mobileActions(s, approved, changed) : ""}
    </main>`;
  }

  function studioActions(s, approved, changed) {
    if (state.captionEditing) {
      return `<button class="btn btn-ghost" data-act="caption-cancel">Cancel</button>
        <button class="btn btn-primary" data-act="caption-save">Save caption${icon("check")}</button>`;
    }
    if (approved) {
      return `<button class="btn btn-ghost" data-act="undo-approve">${icon("undo")} Undo approval</button>
        <a class="btn btn-primary" href="#/runs">${icon("runs")} View run</a>`;
    }
    if (changed) {
      return `<span class="stamp attention">Changes requested</span><a class="btn btn-ghost" href="#/desk">Back to desk</a>`;
    }
    if (s.status === "final") {
      return `<button class="btn btn-ghost" data-act="changes">Request changes</button>
        <button class="btn btn-primary" data-act="approve">Approve final cut${icon("check")}</button>`;
    }
    if (s.status === "exception") {
      return `<button class="btn btn-ghost" data-act="changes">Request changes</button>
        <button class="btn btn-primary" data-act="fix-caption">Fix the opening${icon("arrowRight")}</button>`;
    }
    if (s.status === "failed") {
      return `<button class="btn btn-ghost" data-act="changes">Request changes</button>
        <a class="btn btn-primary" href="#/runs">Open the run${icon("arrowRight")}</a>`;
    }
    return `<a class="btn btn-ghost" href="#/desk">Back to desk</a>
      <a class="btn btn-primary" href="https://myhermes.phoneme.in/story/${s.date}" target="_blank" rel="noopener noreferrer">Open on the live board${icon("external")}</a>`;
  }

  function mobileActions(s, approved, changed) {
    if (state.captionEditing) {
      return `<div class="mobile-actions">
        <button class="btn btn-ghost" data-act="caption-cancel">Cancel</button>
        <button class="btn btn-primary" data-act="caption-save">Save caption</button>
      </div>`;
    }
    if (approved || changed) return "";
    if (s.status !== "final" && s.status !== "exception") return "";
    return `<div class="mobile-actions">
      <button class="btn btn-ghost" data-act="changes">Request changes</button>
      <button class="btn btn-primary" data-act="${s.status === "final" ? "approve" : "fix-caption"}">${s.status === "final" ? "Approve final cut" : "Fix the opening"}</button>
    </div>`;
  }

  function emptyStudio(s) {
    const planned = s.status === "planned";
    return `<div class="empty" style="margin-top:24px">
      <span class="stamp ${planned ? "idle" : "gold"}">${planned ? "On the plan" : "In production"}</span>
      <h2>${planned ? "Not on the desk yet" : "The cut is being made"}</h2>
      <p>${planned ? "The calendar has this story, but the research agent has not opened it. The hook and the slot are already set; the first run will turn them into a pack." : "The script is ready and Hermes is moving it through render and voice. You will see the final cut here, at the one gate."}</p>
      <div class="actions">
        <button class="btn btn-primary" data-act="start-story">${icon("spark")} Ask Hermes to start</button>
        <a class="btn btn-ghost" href="#/calendar">Back to the calendar</a>
        <a class="btn btn-quiet" href="https://myhermes.phoneme.in/story/${s.date}" target="_blank" rel="noopener noreferrer">Open on the live board ${icon("external")}</a>
      </div>
      ${s.hook ? `<p style="margin-top:14px;font-family:var(--f-display);font-size:22px;line-height:1.3;color:var(--plum);max-width:46ch">“${esc(s.hook)}”</p>` : ""}
    </div>`;
  }

  /* ---------- cut tab ---------- */
  function cutTab(s) {
    return `<div class="studio-grid">
      <div class="studio-main">${ledger(s)}</div>
      <aside class="studio-aside">${previewPanel(s)}</aside>
    </div>`;
  }

  function ledger(s) {
    return `<div class="ledger">
      <div class="ledger-head"><span>Scene</span><span>Visual</span><span>On screen &amp; spoken</span><span>State</span><span>Length</span><span></span></div>
      ${s.scenes.map((sc, i) => {
        const open = state.openScene === i;
        const selected = state.scene === i;
        const stateLabel = sc.state === "updated" ? "Updated" : sc.state === "check" ? "Check" : sc.state === "running" ? "Rendering" : sc.state === "failed" ? "Failed" : sc.state === "final" ? "Final" : "Locked";
        return `<div class="scene-item ${open ? "is-open" : ""}" data-scene-item="${i}">
          <button class="scene-row ${selected ? "is-selected" : ""}" data-act="scene" data-n="${i}" aria-expanded="${open}" aria-controls="scene-edit-${i}" aria-label="Scene ${sc.n}: ${esc(firstSentence(sc.vo))}">
            <span class="scene-margin"><b>${pad2(sc.n)}</b><span>${fmtTC(sc.start)}</span></span>
            <span class="scene-thumb" aria-hidden="true">${sceneArt(s, sc)}</span>
            <span class="scene-main">
              <span class="scene-on">${esc(sc.on.replace(/\n/g, " / "))}</span>
              <span class="scene-vo">${esc(sc.vo)}</span>
            </span>
            <span class="scene-state ${sc.state}">${sc.state === "updated" ? icon("spark") : sc.state === "check" ? icon("alert") : sc.state === "running" ? icon("clock") : sc.state === "failed" ? icon("xCircle") : icon("check")}${stateLabel}</span>
            <span class="scene-dur">${sc.dur.toFixed(1)}s</span>
            <span class="scene-more" aria-hidden="true">${icon("chevronRight")}</span>
          </button>
          <div class="scene-edit" id="scene-edit-${i}">
            <div class="edit-grid">
              <div class="field"><label for="on-${sc.n}">On screen</label><textarea id="on-${sc.n}" data-scene-field="on" data-n="${i}" rows="2">${esc(sc.on)}</textarea></div>
              <div class="field"><label for="vo-${sc.n}">Voiceover line</label><textarea id="vo-${sc.n}" data-scene-field="vo" data-n="${i}" rows="2">${esc(sc.vo)}</textarea></div>
            </div>
            <p class="scene-visual-note">${esc(sc.visual)} <span class="mono" style="color:var(--muted-2)">· ${esc(sc.note)}</span></p>
            ${sc.photos ? `<p class="scene-credit">Photos: ${sc.photos.map((p) => D.photos[p.key]?.name).filter(Boolean).join(" · ")}</p>` : ""}
            <div class="edit-actions">
              <button class="btn btn-sm btn-ghost" data-act="regen" data-n="${i}">${icon("refresh")} Regenerate visual</button>
              <button class="btn btn-sm btn-ghost" data-act="revoice" data-n="${i}">${icon("play")} Re-voice line</button>
              <button class="btn btn-sm btn-quiet" data-act="alternatives">${icon("spark")} Ask for alternatives</button>
              <span class="edit-note">${sc.state === "updated" ? "v3 · re-voiced 16:42" : "Locked in the cut"}</span>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
  }

  function previewPanel(s) {
    const sc = s.scenes[state.scene];
    const total = totalDur(s);
    const approved = state.approved.has(s.date);
    return `<div class="preview-head"><h2>Live preview</h2><span class="mono" id="preview-scene-label">SCENE ${pad2(sc.n)} / ${pad2(s.scenes.length)}</span></div>
      <div class="preview-frame">
        <div class="preview-screen" id="preview-screen">
          <div id="preview-art" style="position:absolute;inset:0">${sceneArt(s, sc)}</div>
          ${state.safe ? `<div class="safe top"><span>UI safe</span></div><div class="safe bottom"><span>UI safe</span></div>` : ""}
          <div class="preview-caption" id="preview-caption"><div class="who">${esc(s.woman)}</div><div class="line">${esc(sc.vo)}</div></div>
          <button class="preview-play ${state.playing ? "is-playing" : ""}" data-act="toggle-play" tabindex="-1" aria-hidden="true">${icon(state.playing ? "pause" : "play")}</button>
          <div class="preview-progress"><i id="preview-progress" style="width:${(state.playTime / total) * 100}%"></i></div>
          ${approved ? `<div class="approved-stamp">Approved<small>19 Nov · 17:12</small></div>` : ""}
        </div>
      </div>
      <div class="preview-bar">
        <button class="icon-btn" data-act="toggle-play" aria-label="${state.playing ? "Pause" : "Play"}">${icon(state.playing ? "pause" : "play")}</button>
        <span class="timecode" id="preview-time">${fmtTC(state.playTime)} / ${fmtTC(total)}</span>
        <button class="icon-btn" data-act="safe" aria-pressed="${state.safe}" aria-label="Toggle Instagram safe zones">${icon("target")}</button>
      </div>
      ${wave(s)}
      ${gateNote(s, approved)}
    </div>`;
  }

  function wave(s) {
    const total = totalDur(s);
    const bars = Array.from({ length: 84 }, (_, i) => {
      const h = 14 + Math.round(64 * Math.abs(Math.sin(i * 1.71 + 0.7)) * (0.55 + 0.45 * Math.abs(Math.sin(i * 0.37))));
      return `<i style="height:${h}%"></i>`;
    }).join("");
    return `<div class="wave" id="wave" role="slider" tabindex="0" aria-label="Scrub the cut" aria-valuemin="0" aria-valuemax="${Math.round(total)}" aria-valuenow="${Math.round(state.playTime)}" aria-valuetext="${fmtTC(state.playTime)}">
      <div class="wave-bars">${bars}</div>
      <div class="wave-bars played" id="wave-played" style="clip-path:inset(0 ${100 - (state.playTime / total) * 100}% 0 0)">${bars}</div>
      ${s.scenes.slice(1).map((sc) => `<span class="wave-tick" style="left:${(sc.start / total) * 100}%"></span>`).join("")}
    </div>
    <div class="wave-ticks">${s.scenes.map((sc) => `<span style="left:${(sc.start / total) * 100}%"><b>${sc.n}</b></span>`).join("")}</div>`;
  }

  function gateNote(s, approved) {
    if (approved) {
      return `<div class="gate-note"><h3>Approved at the gate</h3><p>Scheduled for ${esc(s.slot)} IST. The publish script will post it if the status is still Approved at the slot.</p><div class="passlist"><span>${icon("check")} Script</span><span>${icon("check")} Facts</span><span>${icon("check")} Render</span><span>${icon("check")} Voice</span></div></div>`;
    }
    if (state.changes.has(s.date)) {
      return `<div class="gate-note"><h3>Changes requested</h3><p>Hermes has your note. It will re-cut the affected scenes and bring the next version back here.</p></div>`;
    }
    if (s.status === "rendering") {
      return `<div class="gate-note"><h3>Still running</h3><p>Scene 4 of 7 is rendering, then voice. The gate opens when the cut is complete; there is nothing for you to do yet.</p><div class="passlist"><span>${icon("check")} Script</span><span>${icon("check")} Facts</span><span>${icon("clock")} Render</span><span>${icon("circle")} Voice</span></div></div>`;
    }
    if (s.status === "failed") {
      return `<div class="gate-note"><h3>Stopped before the gate</h3><p>Scene 4 audio runs 42.6s in a 40.0s window. Retry the scene or ask for a change; the rest of the cut stays.</p><div class="passlist"><span>${icon("check")} Script</span><span>${icon("check")} Facts</span><span>${icon("xCircle")} Render</span><span>${icon("circle")} Voice</span></div></div>`;
    }
    const slot = nextSlot(s);
    const late = s.date < D.today;
    return `<div class="gate-note"><h3>One gate: this cut</h3><p>Script, sources, render and voice have passed. ${late ? "This cut is late. Approving moves it to today at 20:30 IST." : "Approving schedules the Reel for " + esc(slot.label) + "."} It commits two files. You can withdraw it until ${esc(slot.undo)} IST.</p><div class="passlist"><span>${icon("check")} Script</span><span>${icon("check")} Facts 3/3</span><span>${icon("check")} Render 7/7</span><span>${icon("check")} Voice</span></div></div>`;
  }

  /* ---------- script tab ---------- */
  function scriptTab(s) {
    const script = s.date === "2026-11-18" ? D.script : null;
    if (!script) {
      return `<div class="script-view">
        <div class="script-block"><div class="script-label"><h3>On-screen hook</h3><span class="mono">${esc(s.woman)}</span></div><p class="script-hook">${esc(s.hook)}</p></div>
        <div class="script-block"><div class="script-label"><h3>The pack</h3><span class="mono">${esc(s.detail)}</span></div><p class="script-vo">The full script lives in the pack in the repo. This prototype shows the final-cut gate; open the live board for the complete markdown.</p><div class="script-actions"><a class="btn btn-sm btn-ghost" href="https://myhermes.phoneme.in/story/${s.date}" target="_blank" rel="noopener noreferrer">Open the live pack ${icon("external")}</a></div></div>
      </div>`;
    }
    const vo = esc(script.vo)
      .replace("Lynn Conway", "<mark>Lynn Conway</mark>")
      .replace("She led the way.", "<mark>She led the way.</mark>");
    return `<div class="script-view">
      <div class="script-block">
        <div class="script-label"><h3>On-screen hook</h3><span class="mono">2 sentences · 13 words</span></div>
        <p class="script-hook">${esc(script.hook)}</p>
        <div class="script-meta"><span>Gold label: ${esc(script.label)}</span></div>
        <div class="script-actions"><button class="btn btn-sm btn-ghost" data-act="alternatives">${icon("spark")} Ask for 3 options</button><button class="btn btn-sm btn-quiet" data-act="copy-script">Copy</button></div>
      </div>
      <div class="script-block">
        <div class="script-label"><h3>Voiceover</h3><span class="mono">96 words · 00:38</span></div>
        <p class="script-vo">${vo}</p>
        <div class="script-meta"><span>Full name in sentence two</span><span>Ends “She led the way.”</span><span>30–45s target</span></div>
        <div class="script-actions"><button class="btn btn-sm btn-ghost" data-act="alternatives">${icon("spark")} Ask for 3 options</button><button class="btn btn-sm btn-quiet" data-act="copy-script">Copy</button></div>
      </div>
      <div class="script-block">
        <div class="script-label"><h3>Visual direction</h3><span class="mono">from the pack</span></div>
        <p class="script-vo" style="font-size:14px">Text-led Reel in deep plum, with gold highlights and a simple chip-layout illustration. No AI-generated photograph; an archival image only if licensed and credited.</p>
      </div>
    </div>`;
  }

  /* ---------- caption tab ---------- */
  const CAPTION_OVERRIDE = {
    "2026-11-20": {
      opening: "Padmasree Warrior’s Cisco career followed years of engineering leadership at Motorola, then a decade shaping technology strategy at Cisco.",
      caption: "Padmasree Warrior’s Cisco career followed years of engineering leadership at Motorola, then a decade shaping technology strategy at Cisco.\n\nShe studied chemical engineering at IIT Delhi, earned a master’s at Cornell and joined Motorola in 1984. In 2003, Motorola named her corporate CTO; her work included leading Motorola Labs and emerging technologies.\n\nCisco appointed her CTO in 2007, with responsibility for technology strategy and direction. Her path connected semiconductor work, product development, engineering and corporate strategy.\n\nSave this for your next career reflection, or send it to someone growing from building technology to shaping its direction.\n\n#PadmasreeWarrior #Cisco #TechnologyLeadership #SheLedTheWay",
      primary: "Padmasree Warrior’s Cisco career",
      hashtags: ["#PadmasreeWarrior", "#Cisco", "#TechnologyLeadership", "#SheLedTheWay"],
      alt: "A deep-plum text-led carousel cover with ivory lettering and a gold Padmasree Warrior label connects joining Motorola in 1984 with becoming Cisco CTO in 2007.",
    },
  };
  function captionFor(s) {
    let base;
    if (s.date === "2026-11-18") {
      base = {
        opening: D.script.opening, caption: D.script.caption, primary: D.script.primary,
        supporting: D.script.supporting, hashtags: D.script.hashtags, alt: D.script.alt,
      };
    } else if (CAPTION_OVERRIDE[s.date]) {
      base = { ...CAPTION_OVERRIDE[s.date] };
    } else {
      base = {
        opening: firstSentence(s.hook), caption: s.hook + "\n\nSave this story, or send it to someone who needs it.\n\n#" + s.woman.replace(/[^\w]/g, "") + " #SheLedTheWay",
        primary: s.woman, supporting: [s.pillar, s.format], hashtags: ["#" + s.woman.replace(/[^\w]/g, ""), "#SheLedTheWay"], alt: s.hook,
      };
    }
    return state.captions[s.date] ? { ...base, ...state.captions[s.date] } : base;
  }
  function captionTab(s) {
    const c = captionFor(s);
    const editing = state.captionEditing;
    const draft = state.captionDraft ?? c.caption;
    const opening = editing ? (draft.split("\n")[0] || "") : c.opening;
    const len = opening.length;
    const over = len > 125;
    const meter = `<div class="row"><span class="label">Caption opening · search snippet</span><span class="count ${over ? "over" : ""}" ${editing ? 'id="caption-live-count"' : ""}>${len} / 125</span></div>
      <div class="meter ${over ? "over" : ""}" ${editing ? 'id="caption-live-meter"' : ""}><i style="width:${Math.min(100, (len / 125) * 100)}%"></i></div>
      <p class="opening-text" ${editing ? 'id="caption-live-text"' : ""}>${esc(opening)}</p>
      ${over ? `<p style="margin-top:6px;font-size:10.5px;color:var(--rose)" ${editing ? 'id="caption-live-note"' : ""}>Trim ${len - 125} characters. Keep her name and the primary keyword in the first sentence.</p>` : ""}`;
    return `<div class="caption-grid">
      <div class="caption-main">
        <div class="opening-meter">${meter}</div>
        ${editing ? `<textarea id="caption-editor" style="width:100%;min-height:300px;padding:14px;border:1px solid var(--gold);background:var(--surface);font:13px/1.65 var(--f-ui);resize:vertical">${esc(draft)}</textarea>
          <div class="caption-tools"><button class="btn btn-sm btn-primary" data-act="caption-save">Save caption</button><button class="btn btn-sm btn-ghost" data-act="caption-cancel">Cancel</button></div>`
          : `<div class="caption-prose">${esc(c.caption)}</div>
          <div class="caption-tools"><button class="btn btn-sm btn-ghost" data-act="caption-edit">Edit caption</button><button class="btn btn-sm btn-quiet" data-act="copy-caption">Copy caption</button><button class="btn btn-sm btn-quiet" data-act="alternatives">${icon("spark")} Ask for 3 options</button></div>`}
      </div>
      <aside class="caption-side">
        <div class="side-group"><h3>Primary keyword</h3><div class="kw-list"><span>${icon("check")} ${esc(c.primary)}</span></div></div>
        <div class="side-group"><h3>Supporting keywords</h3><div class="kw-list">${(c.supporting || []).map((k) => `<span>${icon("check")} ${esc(k)}</span>`).join("")}</div></div>
        <div class="side-group"><h3>Hashtags · ${c.hashtags.length}</h3><div class="hashtags">${c.hashtags.map((h) => `<span>${esc(h)}</span>`).join("")}</div></div>
        <div class="side-group"><h3>Alt text</h3><p class="alt-text">${esc(c.alt)}</p></div>
        <div class="side-group"><h3>Search checks</h3><div class="kw-list"><span>${icon("check")} ${s.format === "Reel" ? "Name in sentence two" : "Name in the opening"}</span><span>${icon("check")} On-screen label matches</span><span>${icon("check")} No keyword stuffing</span></div></div>
      </aside>
    </div>`;
  }

  /* ---------- slides tab ---------- */
  function slidesTab(s) {
    const active = state.scene;
    const c = captionFor(s);
    const len = c.opening.length;
    const over = len > 125;
    return `<div class="studio-grid">
      <div class="studio-main">
        <div class="ledger slides-ledger">
          <div class="ledger-head"><span>Slide</span><span>Visual</span><span>Idea</span><span>State</span><span>Size</span><span></span></div>
          ${s.slides.map((text, i) => `<div class="scene-item" data-scene-item="${i}">
            <button class="scene-row ${active === i ? "is-selected" : ""}" data-act="scene" data-n="${i}">
              <span class="scene-margin"><b>${pad2(i + 1)}</b><span>4:5</span></span>
              <span class="scene-thumb slide-thumb" aria-hidden="true">${slideArt(s, i)}</span>
              <span class="scene-main"><span class="scene-on">SLIDE ${pad2(i + 1)} / ${pad2(s.slides.length)}</span><span class="scene-vo">${esc(text)}</span></span>
              <span class="scene-state">${icon("check")}Locked</span>
              <span class="scene-dur">1080</span>
              <span></span>
            </button>
          </div>`).join("")}
        </div>
      </div>
      <aside class="studio-aside">
        <div class="preview-head"><h2>Cover preview</h2><span class="mono" id="slide-label">SLIDE ${pad2(active + 1)} / ${pad2(s.slides.length)}</span></div>
        <div class="preview-frame" style="max-width:300px">
          <div class="preview-screen" style="aspect-ratio:4/5"><div id="slide-preview" style="position:absolute;inset:0">${slideArt(s, active)}</div></div>
        </div>
        <div class="gate-note"><h3>${over ? "Caption is the gate" : "Caption passes"}</h3><p>${over ? `The carousel is rendered. The caption opening is ${len} / 125; trim ${len - 125} characters to open the gate.` : `The caption opening is ${len} / 125. The carousel is ready for the final gate.`}</p><div class="actions"><button class="btn btn-sm btn-primary" data-act="tab" data-tab="caption">${over ? "Open the caption" : "Review the caption"}</button></div></div>
      </aside>
    </div>`;
  }

  function updateSlidePreview() {
    const s = story(state.date);
    if (!s || !s.slides) return;
    const el = $("#slide-preview");
    if (el) el.innerHTML = slideArt(s, state.scene);
    const label = $("#slide-label");
    if (label) label.textContent = `SLIDE ${pad2(state.scene + 1)} / ${pad2(s.slides.length)}`;
  }

  /* ---------- facts tab ---------- */
  function factsFor(s) {
    if (s.date === "2026-11-18") return D.facts;
    if (s.date === "2026-11-19") return [
      { text: "Wilson’s BBC Micro work, BASIC interpreter and the prototype built in under a week are documented by the Computer History Museum and the Science Museum Group.", source: "Computer History Museum" },
      { text: "ARM’s reduced-instruction-set approach and its development in the 1980s are documented by the Computer History Museum oral history.", source: "Science Museum Group" },
      { text: "The script names Steve Furber as co-designer and avoids claiming Wilson alone invented ARM.", source: "CHM profile" },
    ];
    if (s.date === "2026-11-21") return [
      { text: "Yale and IEEE describe A-0 as a compiler developed by Hopper’s team in 1952.", source: "Yale" },
      { text: "FLOW-MATIC used English-like commands and helped shape COBOL; COBOL was a collaborative project, not Hopper’s solo invention.", source: "IEEE" },
    ];
    if (s.date === "2026-11-20") return [
      { text: "Warrior joined Motorola in 1984, was named corporate CTO in 2003, and became Cisco’s CTO in 2007.", source: "Cisco" },
      { text: "She studied chemical engineering at IIT Delhi and earned a master’s at Cornell.", source: "Cornell" },
    ];
    return [{ text: "The fact-check gate passed for this pack. Every claim maps to a citation in the pack’s Fact-check notes.", source: "Pack" }];
  }
  function photoCredits(s) {
    const keys = new Set();
    (D.coverPhotos[s.date] || []).forEach((p) => keys.add(p.key));
    (s.scenes || []).forEach((sc) => (sc.photos || []).forEach((p) => keys.add(p.key)));
    return [...keys].map((k) => D.photos[k]).filter(Boolean);
  }

  function factsTab(s) {
    const facts = factsFor(s);
    return `<div class="facts">
      ${facts.map((f) => `<div class="claim"><span class="mark done">${icon("checkCircle")}</span><div><p>${esc(f.text)}</p><span class="src">${esc(f.source)} ${icon("external")}</span></div></div>`).join("")}
      <div class="source-list">
        <div class="section-head" style="padding-top:14px"><h2>Sources on hand</h2><span class="count">${s.date === "2026-11-18" ? "3 links" : "in the pack"}</span></div>
        ${s.date === "2026-11-18"
          ? D.sources.map((src) => `<a class="source-row" href="${src.url}" target="_blank" rel="noopener noreferrer"><span class="kind">${esc(src.kind)}</span><span class="name">${esc(src.name)}</span><span class="domain">${new URL(src.url).hostname.replace("www.", "")}</span>${icon("external")}</a>`).join("")
          : `<p class="muted" style="font-size:11.5px">Sources are attached to the pack in the repo. The gate counts two reputable sources per claim.</p>`}
      </div>
      ${photoCredits(s).length ? `<div class="source-list">
        <div class="section-head" style="padding-top:18px"><h2>Photographs</h2><span class="count">${photoCredits(s).length} archive images</span></div>
        ${photoCredits(s).map((a) => `<a class="source-row" href="${a.source}" target="_blank" rel="noopener noreferrer"><span class="kind">${esc(a.license)}</span><span class="name">${esc(a.name)}</span><span class="domain">${esc(a.credit)}</span>${icon("external")}</a>`).join("")}
        <p class="photo-note">Duotoned for this prototype. No AI-generated likeness; every image is credited and linked.</p>
      </div>` : ""}
      <div class="fact-rule">No invented quotes. No current net-worth figures. A disputed “first” is disclosed in the caption, not hidden.</div>
    </div>`;
  }

  /* ---------- history tab ---------- */
  function historyTab(s) {
    const extra = [];
    if (state.approved.has(s.date)) extra.push({ at: "17:12", date: "19 Nov", who: "You", what: "Approved the final cut", detail: "Scheduled for " + s.slot + " IST · commit 3f2a1c", kind: "human" });
    if (state.changes.has(s.date)) extra.push({ at: "17:12", date: "19 Nov", who: "You", what: "Requested changes", detail: "Note sent to Hermes · will re-cut and re-voice", kind: "human" });
    const items = s.date === "2026-11-18" ? [...extra, ...D.history] : [...extra, { at: "16:41", date: fmtDate(s.date), who: "Hermes", what: s.detail, detail: "Pipeline state", kind: "machine" }];
    return `<div class="timeline">
      ${items.map((h) => `<div class="tl-item">
        <div class="tl-time"><b>${esc(h.at)}</b>${esc(h.date)}</div>
        <div class="tl-dot" aria-hidden="true"></div>
        <div><div class="tl-what">${esc(h.what)}</div><div class="tl-detail">${esc(h.detail)}</div><div class="tl-who ${h.kind === "human" ? "human" : ""}">${esc(h.who)}</div></div>
      </div>`).join("")}
    </div>`;
  }

  /* ------------------------------------------------------------
     calendar
     ------------------------------------------------------------ */
  function monthCells(month) {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push({ out: true });
    for (let d = 1; d <= days; d++) {
      const date = `${y}-${pad2(m)}-${pad2(d)}`;
      cells.push({ date, day: d, story: story(date) });
    }
    return cells;
  }

  function matchesFilter(s) {
    if (!s) return false;
    if (state.filter === "all") return true;
    if (state.filter === "reel") return s.format === "Reel";
    if (state.filter === "carousel") return s.format === "Carousel";
    if (state.filter === "replay") return s.format === "Recap";
    return true;
  }

  function calendar() {
    const selected = story(state.calDate);
    const isRun = state.calView === "run";
    const narrow = window.innerWidth <= 760;
    const cells = isRun ? runCells(state.calStart) : monthCells(state.calMonth);
    const heading = narrow ? weekLabel(state.calDate) : isRun ? runLabel(state.calStart) : monthLabel(state.calMonth);
    const week = weekOf(state.calDate);
    return `<main id="main" class="page">
      <div class="page-head">
        <div><h1>Calendar</h1><p class="sub">The next five weeks, day by day. The slot is 19:00–21:00 IST; clean work advances to the one gate without a prompt.</p></div>
        <div class="head-actions">
          <div class="seg" role="group" aria-label="Calendar view">
            <button data-act="cal-view" data-view="run" aria-pressed="${state.calView === "run"}">5 weeks</button>
            <button data-act="cal-view" data-view="month" aria-pressed="${state.calView === "month"}">Month</button>
          </div>
        </div>
      </div>
      <div class="cal-top">
        <button class="btn-icon" data-act="cal-prev" aria-label="${isRun ? "Previous four weeks" : "Previous month"}">${icon("chevronLeft")}</button>
        <span class="cal-month">${heading}</span>
        <button class="btn-icon" data-act="cal-next" aria-label="${isRun ? "Next four weeks" : "Next month"}">${icon("chevronRight")}</button>
        <button class="btn btn-sm btn-ghost" data-act="cal-today">Today</button>
        <span class="spacer"></span>
        <div class="chip-row" role="group" aria-label="Filter by format">
          ${[["all", "All"], ["reel", "Reels"], ["carousel", "Carousels"], ["replay", "Recaps"]].map(([id, label]) => `<button class="chip" data-act="filter" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="cal-shell">
        <div>
          <div class="cal-grid" aria-label="${heading}">
            ${DOW.map((d) => `<div class="cal-dow">${d}</div>`).join("")}
            ${cells.map((c) => {
              if (c.out) return `<div class="cal-cell is-out"></div>`;
              const s = c.story && matchesFilter(c.story) ? c.story : null;
              const st = s ? displayStatus(s) : null;
              const selectedCell = state.calDate === c.date;
              const todayCell = c.date === D.today;
              return `<button class="cal-cell ${selectedCell ? "is-selected" : ""} ${todayCell ? "is-today" : ""}" data-act="cal-select" data-date="${c.date}" aria-label="${fmtDate(c.date, { long: true })}${s ? ": " + s.woman + ", " + st.label : ""}">
                <span class="cal-date">${c.day}</span>
                ${c.date === cells[0]?.date ? `<span class="cal-month-tag">${MONTHS_S[parse(c.date).getUTCMonth()]}</span>` : c.date.endsWith("-01") ? `<span class="cal-month-tag">${MONTHS_S[parse(c.date).getUTCMonth()]}</span>` : ""}
                ${s ? `<span class="cal-state">${markIcon(st)}</span>` : ""}
                ${s ? `<span class="cal-name">${esc(s.woman)}</span><span class="cal-fmt">${esc(s.format)}</span><span class="cal-time">${esc(s.slot)}</span>` : ""}
                ${s && (st.mark === "attention" || st.mark === "fail") && !state.approved.has(s.date) && !state.changes.has(s.date) ? `<span class="cal-reason">${esc(s.detail)}</span>` : ""}
              </button>`;
            }).join("")}
          </div>
          <div class="agenda">
            ${week.map((date) => {
              const s = story(date);
              const st = displayStatus(s);
              return `<button class="agenda-row ${state.calDate === date ? "is-selected" : ""}" data-act="cal-select" data-date="${date}">
                <span class="agenda-date"><b>${parse(date).getUTCDate()}</b>${DOW[(parse(date).getUTCDay() + 6) % 7]}</span>
                <span><span class="agenda-name">${s ? esc(s.woman) : "No story"}</span><span class="agenda-meta">${s ? esc(s.format) + " · " + esc(st.label) : "Open slot"}</span></span>
                ${s ? markIcon(st) : ""}
              </button>`;
            }).join("")}
          </div>
          <div class="cal-legend">
            <span>${icon("check")} Published / scheduled</span>
            <span>${icon("clock")} Running</span>
            <span>${icon("alert")} Needs you</span>
            <span>${icon("circle")} Planned</span>
          </div>
        </div>
        ${calSide(selected)}
      </div>
    </main>`;
  }

  function calSide(s) {
    if (!s) {
      return `<aside class="cal-side"><div class="side-date">${fmtDate(state.calDate, { long: true })}</div><p class="side-empty" style="margin-top:10px">No story on the plan for this date. The calendar has open slots through December.</p><div class="side-actions"><a class="btn btn-ghost" href="#/desk">Back to the desk</a></div></aside>`;
    }
    const st = displayStatus(s);
    return `<aside class="cal-side">
      <div class="side-date">${fmtDate(s.date, { long: true })}</div>
      <div class="side-name">${esc(s.woman)}</div>
      <div class="side-hook">${esc(s.hook)}</div>
      <div class="side-cover" role="img" aria-label="${esc(coverAlt(s))}">${posterArt(s)}${state.approved.has(s.date) ? `<div class="approved-stamp" style="font-size:8px;right:4%;top:30%;bottom:auto">Approved</div>` : ""}</div>
      ${stamp(st)}
      <div class="side-meta">
        <div><span>Pillar</span><b>${esc(s.pillar)}</b></div>
        <div><span>Format</span><b>${esc(s.format)}</b></div>
        <div><span>Slot</span><b>${esc(s.slot)} IST</b></div>
        <div><span>Gate</span><b>${esc(st.detail)}</b></div>
      </div>
      <div class="side-actions">
        <a class="btn btn-primary" href="#/studio/${s.date}">${hasCut(s) ? "Open the proof" : "Open the story"}${icon("arrowRight")}</a>
        <a class="btn btn-ghost" href="https://myhermes.phoneme.in/story/${s.date}" target="_blank" rel="noopener noreferrer">Live board ${icon("external")}</a>
      </div>
    </aside>`;
  }

  /* ------------------------------------------------------------
     runs
     ------------------------------------------------------------ */
  function runs() {
    return `<main id="main" class="page">
      <div class="page-head">
        <div><h1>Runs</h1><p class="sub">What Hermes is doing, what passed, and the one thing waiting for you. Autopilot is on.</p></div>
        <div class="head-actions"><span class="stamp live">${icon("check")} Autopilot on</span><button class="btn btn-sm btn-ghost" data-act="pause-all">Pause all</button></div>
      </div>
      ${nowPanel()}
      <div class="rail-wrap">
        <div class="stage-rail">
          ${D.stageRail.map((n, i) => `<button class="stage-node ${n.state}" data-act="stage" data-index="${i}">
            <span class="node-dot"></span><span class="node-name">${esc(n.name)}</span><span class="node-time">${esc(n.time)}</span><span class="node-state">${n.state === "done" ? "Passed" : n.state === "running" ? "Running" : "Queued"}</span>
          </button>`).join("")}
        </div>
      </div>
      <div class="runs-grid">
        <div>
          <div class="section-head" style="padding-top:0"><h2>Recent runs</h2><span class="count">last 24 hours</span></div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Time</th><th>Story</th><th>Stage</th><th>Result</th><th>Detail</th><th>Duration</th><th><span class="sr-only">Open</span></th></tr></thead>
              <tbody>
                ${D.runs.map((r, i) => `<tr class="is-clickable" data-act="run" data-index="${i}">
                  <td class="t-mono">${r.time}</td><td class="t-name">${esc(r.story)}</td><td>${esc(r.stage)}</td>
                  <td><span class="t-state ${r.result}">${r.result === "done" ? icon("check") : r.result === "running" ? icon("clock") : r.result === "failed" ? icon("xCircle") : icon("alert")}${r.result}</span></td>
                  <td class="t-detail">${esc(r.detail)}</td><td class="t-mono">${esc(r.duration)}</td><td><button class="btn-icon" data-act="run" data-index="${i}" aria-label="Open ${esc(r.story)} run">${icon("chevronRight")}</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
          <div class="runs-list-mobile">
            ${D.runs.map((r, i) => `<button class="run-row" data-act="run" data-index="${i}">
              <span class="rr-time">${r.time}</span>
              <span class="rr-main"><span class="rr-story">${esc(r.story)}</span><span class="rr-detail">${esc(r.stage)} · ${esc(r.detail)}</span></span>
              <span class="t-state ${r.result}">${r.result === "done" ? icon("check") : r.result === "running" ? icon("clock") : r.result === "failed" ? icon("xCircle") : icon("alert")}${r.result}</span>
            </button>`).join("")}
          </div>
        </div>
        <aside class="run-aside">
          <h2>Next in the queue</h2>
          ${[
            ["Padmasree Warrior", "Caption gate · trim to 125", "waiting"],
            ["Grace Hopper", "Retry scene 4 render", "failed"],
            ["Lynn Conway", "Final cut · owner gate", "waiting"],
            ["Sophie Wilson", "Voice · after scene 7", "queued"],
          ].map(([name, what, kind]) => `<div class="autopilot-row"><span class="label">${esc(name)}<small>${esc(what)}</small></span><span class="t-state ${kind}">${kind === "failed" ? "retry" : kind}</span></div>`).join("")}
          <h2 style="margin-top:22px">Autonomy</h2>
          <div class="autopilot-row"><span class="label">Auto-advance clean work<small>Research → render → voice</small></span><button class="switch" role="switch" aria-checked="true" data-act="autopilot" aria-label="Auto-advance clean work"></button></div>
          <div class="autopilot-row"><span class="label">Pause at the final cut<small>Your one gate, before scheduling</small></span><button class="switch" role="switch" aria-checked="true" data-act="gate-switch" aria-label="Pause at the final cut"></button></div>
          <div class="autopilot-row"><span class="label">Alert on a failed gate<small>Render, duration or loudness</small></span><button class="switch" role="switch" aria-checked="true" data-act="alert-switch" aria-label="Alert on a failed gate"></button></div>
        </aside>
      </div>
    </main>`;
  }

  function nowPanel() {
    return `<section class="now" aria-label="Currently running">
      <div class="now-main">
        <div class="now-kicker"><span class="pulse"></span>Running now · Hermes</div>
        <div class="now-title">Sophie Wilson</div>
        <div class="now-sub">Render &amp; voice · scene 4 of 7 · started 17:03 IST</div>
        <div class="now-stats">
          <div><span class="k">Elapsed</span><span class="v">00:22</span></div>
          <div><span class="k">Next</span><span class="v">voice</span></div>
          <div><span class="k">ETA</span><span class="v">~2 min</span></div>
          <div><span class="k">Gate</span><span class="v">final cut</span></div>
        </div>
        <div class="now-progress"><i style="width:57%"></i></div>
      </div>
      <div class="now-log">
        <div class="now-log-head"><span>Run log</span><span>sophie-wilson · 19 Nov</span></div>
        <div class="l"><b>17:03:02</b> render scene 4 · <span class="ok">ok</span></div>
        <div class="l"><b>17:03:07</b> audio clip 5.8s · window 5.0s</div>
        <div class="l"><b>17:03:07</b> lengthen scene to 6.0s · <span class="ok">ok</span></div>
        <div class="l"><b>17:03:11</b> encoding 1080×1920 · 30 fps</div>
        <div class="l"><b>17:03:18</b> scene 5 of 7 queued</div>
      </div>
    </section>`;
  }

  /* ------------------------------------------------------------
     rules
     ------------------------------------------------------------ */
  const STAGE_ORDER = ["Research", "Fact-check", "Draft", "SEO", "Render", "Voice", "Review", "Publish"];
  function ruleGroups() {
    const groups = {};
    D.gates.forEach((g, i) => {
      const key = g.stage;
      if (!groups[key]) groups[key] = [];
      groups[key].push({ ...g, i });
    });
    return groups;
  }

  function rules() {
    const groups = ruleGroups();
    const stage = groups[state.ruleStage] ? state.ruleStage : "Draft";
    const list = groups[stage] || [];
    const proposals = D.proposed.filter((p) => p.stage === stage);
    return `<main id="main" class="page">
      <div class="page-head">
        <div><h1>Rules</h1><p class="sub">How Hermes decides. Each stage has a written gate; clean work advances, exceptions stop. Change the rule, not the prompt.</p></div>
        <div class="head-actions">${D.proposed.length ? `<span class="stamp attention">${D.proposed.length} proposed</span>` : `<span class="stamp done">All rules live</span>`}</div>
      </div>
      <div class="rules-shell">
        <nav class="rule-nav" aria-label="Stages">
          ${STAGE_ORDER.filter((s) => groups[s]).map((s) => `<button data-act="rule-stage" data-stage="${s}" aria-current="${stage === s}">
            <span>${s}</span><span class="n">${groups[s].length}${D.proposed.some((p) => p.stage === s) ? " · 1" : ""}</span>
          </button>`).join("")}
        </nav>
        <div>
          <div class="rule-stage-head"><div><h2>${stage}</h2><p>${stageCopy(stage)}</p></div><span class="stamp ${stage === "Review" || stage === "Publish" ? "gold" : "idle"}">${stage === "Review" ? "Owner gate" : stage === "Publish" ? "Locked" : "Auto-advance"}</span></div>
          ${proposals.length ? `<div style="margin-top:16px">${proposals.map(proposal).join("")}</div>` : ""}
          <div style="margin-top:${proposals.length ? "8px" : "4px"}">
            ${list.map((g) => policy(g)).join("")}
          </div>
        </div>
      </div>
    </main>`;
  }

  function stageCopy(stage) {
    return {
      Research: "Find the story and the evidence. The gate refuses a claim that cannot be sourced twice.",
      "Fact-check": "Check first, then write. The gate reads every claim against the sources.",
      Draft: "One obstacle, one turn, one result. The hook is found in the facts, never invented.",
      SEO: "Make the story findable without turning it into a keyword list.",
      Render: "A vertical cut with seven scenes, inside the duration and the safe zones.",
      Voice: "Narration that ends before the fade and ends the story on “She led the way.”",
      Review: "The one gate that belongs to you. No agent may approve this.",
      Publish: "Automatic, but only for a row whose status is exactly Approved.",
    }[stage];
  }

  function policy(g) {
    const isOwner = g.state === "owner";
    const isLocked = g.state === "locked";
    const on = g.state === "auto" || g.state === "owner" || g.state === "locked";
    return `<div class="policy" id="rule-${g.i}">
      <div class="policy-head">
        <div class="policy-title"><h3>${esc(g.rule)}<span class="gate ${isOwner ? "owner" : isLocked ? "locked" : ""}">${isOwner ? "Owner" : isLocked ? "Locked" : "Gate"}</span></h3>
          <p>${esc(g.raw)}</p>
          <div class="policy-meta"><span class="ok">${g.pass} passed</span><span class="${g.paused ? "warn" : ""}">${g.paused} paused</span><span>${on ? "active" : "paused"}</span><span>changed 2 days ago</span></div>
        </div>
        <button class="switch" role="switch" aria-checked="${on}" ${isOwner || isLocked ? "disabled" : ""} data-act="rule-toggle" data-index="${g.i}" aria-label="Toggle ${esc(g.rule)}"></button>
      </div>
      <div class="policy-links">
        <button class="source-toggle" data-act="rule-source" data-index="${g.i}" aria-expanded="false">View source</button>
        <span aria-hidden="true">·</span>
        <button class="link-quiet" data-act="rule-chat" data-index="${g.i}">Discuss with the ${g.stage} agent</button>
      </div>
      <div class="source-pre" id="source-${g.i}" hidden>${esc(g.raw)}

# from agents/${g.stage.toLowerCase().replace(/[^a-z]/g, "")}.md
# the full SOP lives in the repo; this is the rule it enforces</div>
    </div>`;
  }

  function proposal(p) {
    return `<div class="proposal" id="proposal-${p.id}">
      <div class="proposal-top"><span class="mark attention">${icon("spark")}</span><h3>${esc(p.title)}</h3><span class="by">${esc(p.by)} · ${esc(p.when)}</span></div>
      <p>${esc(p.rationale)}</p>
      <div class="diff">
        <div class="before"><span class="dlabel">Now</span>${esc(p.before)}</div>
        <div class="after"><span class="dlabel">Proposed</span>${esc(p.after)}</div>
      </div>
      <div class="proposal-actions"><button class="btn btn-sm btn-primary" data-act="proposal-approve" data-id="${p.id}">Approve change</button><button class="btn btn-sm btn-ghost" data-act="proposal-reject" data-id="${p.id}">Reject</button><button class="btn btn-sm btn-quiet" data-act="proposal-why" data-stage="${p.stage}">Ask why</button></div>
    </div>`;
  }

  /* ------------------------------------------------------------
     overlays
     ------------------------------------------------------------ */
  function render() {
    const y = window.scrollY;
    const body =
      state.screen === "desk" ? desk()
        : state.screen === "studio" ? studio()
          : state.screen === "calendar" ? calendar()
            : state.screen === "runs" ? runs()
              : rules();
    app.innerHTML = topbar() + (state.screen === "desk" ? weekRibbon() : "") + body + bottomNav();
    document.title = state.screen === "desk" ? "SheLedTheWay — The Daily Desk" : `${state.screen[0].toUpperCase() + state.screen.slice(1)} · SheLedTheWay`;
    if (state.screen === "desk" && state.weekAutoScroll && window.innerWidth <= 760) {
      state.weekAutoScroll = false;
      requestAnimationFrame(() => {
        const el = $(".week-day.is-selected");
        const wrap = $(".week");
        if (el && wrap) wrap.scrollLeft = el.offsetLeft - (wrap.clientWidth - el.offsetWidth) / 2;
      });
    }
    renderOverlay();
    if (state.screen === "studio" || state.screen === "desk") window.scrollTo(0, y);
  }

  function renderOverlay() {
    if (!state.overlay) {
      overlayRoot.innerHTML = "";
      document.body.style.overflow = "";
      return;
    }
    const o = state.overlay;
    if (o.type === "palette") {
      overlayRoot.innerHTML = paletteHTML();
      requestAnimationFrame(() => { const i = $("#palette-input"); if (i) i.focus(); });
      return;
    }
    if (o.type === "approve") {
      const s = story(state.date);
      const slot = nextSlot(s);
      const late = s.date < D.today;
      overlayRoot.innerHTML = `<dialog id="modal" aria-labelledby="modal-title">
        <div class="dialog-head"><h2 id="modal-title">Approve this cut?</h2></div>
        <div class="dialog-body">
          <p>This is the one human gate. After this, the Reel schedules itself and publishes at the slot.</p>
          <div class="consequence">
            <div><span>Publishes</span><b>${esc(slot.label)}</b></div>
            <div><span>Destination</span><b>Instagram Reels</b></div>
            <div><span>Commits</span><b>2 files · queue slot, review</b></div>
            <div><span>Undo</span><b>Until ${esc(slot.undo)} IST</b></div>
          </div>
          <p class="dialog-note">${late ? "This cut is a day late. Approving moves its slot to today at 20:30, after Sophie Wilson. " : ""}The cut passed script, sources, render and voice. Approving does not publish immediately; it releases the scheduled slot.</p>
        </div>
        <div class="dialog-actions"><button class="btn btn-ghost" data-act="close-overlay">Cancel</button><button class="btn btn-primary" data-act="confirm-approve">Approve &amp; schedule${icon("check")}</button></div>
      </dialog>`;
      const dlg = $("#modal"); dlg.showModal();
      dlg.addEventListener("close", () => { if (state.overlay?.type === "approve") closeOverlay(); });
      return;
    }
    if (o.type === "changes") {
      overlayRoot.innerHTML = `<dialog id="modal" aria-labelledby="modal-title">
        <div class="dialog-head"><h2 id="modal-title">Request a change</h2></div>
        <div class="dialog-body">
          <p>Hermes re-cuts only what you name. The previous cut stays available in drafts.</p>
          <div class="field" style="margin-top:12px"><label for="change-note">Note for the video agent</label><textarea id="change-note" rows="4" placeholder="For example: keep the visuals and re-voice scene 4 slower."></textarea></div>
          <div class="chip-row" style="margin-top:8px">${["Slow scene 4", "Re-voice the last line", "Tighten the hook"].map((x) => `<button class="chip" data-act="change-chip" data-text="${x}">${x}</button>`).join("")}</div>
        </div>
        <div class="dialog-actions"><button class="btn btn-ghost" data-act="close-overlay">Cancel</button><button class="btn btn-primary" data-act="confirm-changes">Send to Hermes${icon("arrowRight")}</button></div>
      </dialog>`;
      const dlg = $("#modal"); dlg.showModal();
      dlg.addEventListener("close", () => { if (state.overlay?.type === "changes") closeOverlay(); });
      return;
    }
    if (o.type === "run") {
      const r = D.runs[o.index];
      const storyForRun = D.stories.find((x) => x.woman === r.story);
      const failed = r.result === "failed";
      const running = r.result === "running";
      const done = r.result === "done";
      const waiting = r.result === "waiting";
      const paused = r.result === "paused";
      const log = paused
        ? `<b>16:58:02</b> caption gate
<b>16:58:02</b> opening 138 / 125
<b>16:58:02</b> trim 13 characters
<b>16:58:02</b> paused · owner action needed`
        : failed
        ? `<b>16:52:08</b> render scene 4
<b>16:52:19</b> audio clip 42.6s exceeds 40.0s window
<b>16:52:19</b> gate failed: duration
<b>16:52:20</b> wrote review/reviews.csv
<b>16:52:20</b> paused · owner action needed`
        : running
          ? `<b>16:44:02</b> render scene 4 · ok
<b>16:44:07</b> audio clip 5.8s · window 5.0s
<b>16:44:07</b> lengthen scene to 6.0s · ok
<b>16:44:11</b> encoding 1080×1920 · 30 fps
<b>16:44:18</b> scene 5 of 7 queued`
          : done
            ? `<b>${r.time}:00</b> ${esc(r.stage)} started
<b>${r.time}:00</b> ${esc(r.detail)}
<b>${r.time}:00</b> gate passed · commit written
<b>${r.time}:00</b> next stage queued`
            : `<b>17:02:00</b> final cut ready
<b>17:02:00</b> one human gate: final cut
<b>17:02:00</b> waiting for owner decision
<b>17:02:00</b> no agent may approve this`;
      const action = paused
        ? `<a class="btn btn-primary" href="#/studio/${storyForRun?.date || "2026-11-20"}/caption">${icon("arrowRight")} Trim the caption</a>`
        : failed
        ? `<button class="btn btn-primary" data-act="retry" data-date="${storyForRun?.date || "2026-11-21"}">${icon("refresh")} Retry scene 4</button>`
        : running
          ? `<a class="btn btn-primary" href="#/studio/${storyForRun?.date || "2026-11-19"}">${icon("arrowRight")} Open the cut</a>`
          : waiting
            ? `<a class="btn btn-primary" href="#/studio/${storyForRun?.date || "2026-11-18"}">${icon("check")} Review the cut</a>`
            : `<a class="btn btn-primary" href="#/studio/${storyForRun?.date || "2026-11-16"}">${icon("arrowRight")} Open the story</a>`;
      overlayRoot.innerHTML = `<div class="drawer-backdrop" data-act="close-overlay"></div>
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div class="drawer-head"><div><h2 id="drawer-title">${esc(r.story)}</h2><div class="mono">${esc(r.stage)} · ${esc(r.time)} IST</div></div><button class="btn-icon drawer-close" data-act="close-overlay" aria-label="Close">${icon("close")}</button></div>
          <div class="drawer-body">
            <h3>Result</h3><p><span class="t-state ${r.result}">${r.result}</span> · ${esc(r.detail)} · ${esc(r.duration)}</p>
            <h3 style="margin-top:16px">Run log</h3>
            <div class="log">${log}</div>
            <div class="drawer-actions">${action}<button class="btn btn-ghost" data-act="close-overlay">Close</button></div>
            <div class="drawer-section"><h3>${paused ? "Why it stopped" : failed ? "Why it stopped" : running ? "What is happening" : done ? "What passed" : "What is waiting"}</h3><p>${paused ? "The caption opening is 138 characters against a 125-character limit. Trim 13 characters while keeping her name and the primary keyword in the first sentence." : failed ? "The voice clip is 42.6 seconds in a 40-second scene window. The gate refuses to speed up the narration; it asks the video stage to lengthen the scene or the voice stage to trim the line." : running ? "Hermes is encoding scene 4 and will move to voice as soon as the cut is complete. The owner gate opens only when every scene is locked." : done ? "The stage passed its gate and wrote the result to the repo. No owner action was needed." : "The cut is complete and waiting at the one gate. Nothing publishes until the owner approves it."}</p></div>
          </div>
        </aside>`;
      requestAnimationFrame(() => $(".drawer .btn-icon")?.focus());
      return;
    }
    if (o.type === "stage") {
      const node = D.stageRail[o.index];
      const g = D.gates.find((x) => x.stage === (node?.name === "Final gate" ? "Review" : node?.name)) || D.gates[0];
      overlayRoot.innerHTML = `<div class="drawer-backdrop" data-act="close-overlay"></div>
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div class="drawer-head"><div><h2 id="drawer-title">${esc(g.stage)}</h2><div class="mono">Gate ${g.state === "auto" ? "auto-advance" : g.state}</div></div><button class="btn-icon drawer-close" data-act="close-overlay" aria-label="Close">${icon("close")}</button></div>
          <div class="drawer-body">
            <h3>${esc(g.rule)}</h3><p>${esc(g.raw)}</p>
            <div class="side-meta" style="margin-top:14px"><div><span>Passed</span><b>${g.pass}</b></div><div><span>Paused</span><b>${g.paused}</b></div><div><span>State</span><b>${g.state}</b></div></div>
            <div class="drawer-actions"><a class="btn btn-primary" href="#/rules/${g.stage}">Open the rule ${icon("arrowRight")}</a><button class="btn btn-ghost" data-act="close-overlay">Close</button></div>
          </div>
        </aside>`;
      requestAnimationFrame(() => $(".drawer .btn-icon")?.focus());
      return;
    }
    if (o.type === "chat") {
      const stage = o.stage;
      overlayRoot.innerHTML = `<div class="drawer-backdrop" data-act="close-overlay"></div>
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div class="drawer-head"><div><h2 id="drawer-title">${esc(stage)} agent</h2><div class="mono">Discuss a rule · not a prompt</div></div><button class="btn-icon drawer-close" data-act="close-overlay" aria-label="Close">${icon("close")}</button></div>
          <div class="drawer-body">
            <div class="chat" style="display:flex;flex-direction:column;gap:9px">
              <div class="msg agent" style="align-self:flex-start;background:var(--surface);border:1px solid var(--line);padding:8px 12px;max-width:92%"><b style="display:block;font-family:var(--f-mono);font-size:7px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">${esc(stage)} agent</b>I enforce the rule written here. Tell me what should change and I will propose the smallest edit; you approve it before it runs.</div>
              <div class="msg owner" style="align-self:flex-end;background:var(--plum);color:var(--ivory);padding:8px 12px;max-width:92%;font-size:12px"><b style="display:block;font-family:var(--f-mono);font-size:7px;letter-spacing:.08em;text-transform:uppercase;opacity:.7">You</b>Keep the gate, but explain the pause in one line on the desk.</div>
            </div>
            <div class="field" style="margin-top:14px"><label for="chat-text">Message</label><textarea id="chat-text" rows="3" placeholder="Ask about this rule or propose a change"></textarea></div>
            <div class="drawer-actions"><button class="btn btn-primary" data-act="chat-send">Send${icon("arrowRight")}</button><button class="btn btn-ghost" data-act="close-overlay">Close</button></div>
            <p class="dialog-note" style="margin-top:12px">The agent replies in a few minutes. Any rule change comes back as a proposal for your approval.</p>
          </div>
        </aside>`;
      requestAnimationFrame(() => $("#chat-text")?.focus());
      return;
    }
  }

  function paletteListHTML() {
    const q = state.paletteQuery.trim().toLowerCase();
    const stories = D.stories.filter((s) => !q || s.woman.toLowerCase().includes(q) || s.date.includes(q) || s.pillar.toLowerCase().includes(q));
    const pages = [["Desk", "#/desk"], ["Calendar", "#/calendar"], ["Runs", "#/runs"], ["Rules", "#/rules"]].filter(([n]) => !q || n.toLowerCase().includes(q));
    return `${stories.length ? `<div class="palette-group">Stories</div>${stories.map((s, i) => `<button class="palette-item ${state.paletteIndex === i ? "is-active" : ""}" data-act="palette-pick" data-date="${s.date}"><span class="pi-name">${esc(s.woman)}</span><span class="pi-meta">${fmtDate(s.date)} · ${esc(s.format)}</span></button>`).join("")}` : ""}
      ${pages.length ? `<div class="palette-group">Go to</div>${pages.map(([n, h], i) => `<a class="palette-item ${state.paletteIndex === stories.length + i ? "is-active" : ""}" href="${h}" data-act="palette-page"><span class="pi-name">${n}</span><span class="pi-meta">Page</span></a>`).join("")}` : ""}
      ${!stories.length && !pages.length ? `<div class="palette-empty">No story matches “${esc(state.paletteQuery)}”.</div>` : ""}`;
  }

  function paletteHTML() {
    return `<div class="palette-backdrop" data-act="close-overlay">
      <div class="palette" role="dialog" aria-modal="true" aria-label="Search">
        <div class="palette-input">${icon("search")}<input id="palette-input" placeholder="Search a story, a date, a pillar" value="${esc(state.paletteQuery)}" autocomplete="off"><kbd>esc</kbd></div>
        <div class="palette-list" id="palette-list">${paletteListHTML()}</div>
      </div>
    </div>`;
  }

  function openOverlay(o) {
    state.lastFocus = document.activeElement;
    state.overlay = o;
    state.playing = false;
    clearInterval(playTimer);
    document.body.style.overflow = "hidden";
    renderOverlay();
  }
  function closeOverlay() {
    state.overlay = null;
    state.paletteOpen = false;
    document.body.style.overflow = "";
    renderOverlay();
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function copyText(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => toast(message)).catch(() => toast("Copy is blocked in this preview; select the text instead."));
    } else {
      toast("Copy is blocked in this preview; select the text instead.");
    }
  }

  function toast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon("check")}<span>${esc(message)}</span>`;
    toastRegion.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(4px)"; el.style.transition = "opacity .18s, transform .18s"; setTimeout(() => el.remove(), 200); }, 4200);
  }

  /* ------------------------------------------------------------
     playback
     ------------------------------------------------------------ */
  function setPlayIcon() {
    $$(".preview-play").forEach((b) => { b.innerHTML = icon(state.playing ? "pause" : "play"); b.classList.toggle("is-playing", state.playing); });
    $$(".preview-bar [data-act='toggle-play']").forEach((b) => { b.innerHTML = icon(state.playing ? "pause" : "play"); });
  }
  function updatePlayhead() {
    const s = story(state.date);
    if (!s || !s.scenes) return;
    const total = totalDur(s);
    const p = total ? (state.playTime / total) * 100 : 0;
    const bar = $("#preview-progress");
    if (bar) bar.style.width = p + "%";
    const tc = $("#preview-time");
    if (tc) tc.textContent = `${fmtTC(state.playTime)} / ${fmtTC(total)}`;
    const played = $("#wave-played");
    if (played) played.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    const wave = $("#wave");
    if (wave) { wave.setAttribute("aria-valuenow", String(Math.round(state.playTime))); wave.setAttribute("aria-valuetext", fmtTC(state.playTime)); }
  }
  function startPlay() {
    const s = story(state.date);
    if (!s || !s.scenes) return;
    const total = totalDur(s);
    if (state.playTime >= total - 0.05) { state.playTime = 0; state.scene = 0; updatePreview(); updateSceneSelection(); }
    state.playing = true;
    setPlayIcon();
    clearInterval(playTimer);
    playTimer = setInterval(() => {
      const total = totalDur(s);
      state.playTime = Math.min(total, state.playTime + 0.1);
      const idx = sceneAt(s, state.playTime);
      if (idx !== state.scene) {
        state.scene = idx;
        updatePreview();
        updateSceneSelection();
      }
      updatePlayhead();
      if (state.playTime >= total) stopPlay();
    }, 100);
  }
  function stopPlay() {
    state.playing = false;
    clearInterval(playTimer);
    playTimer = null;
    setPlayIcon();
    updatePlayhead();
  }
  function updatePreview() {
    const s = story(state.date);
    if (!s || !s.scenes) return;
    const sc = s.scenes[state.scene];
    const art = $("#preview-art");
    if (art) art.innerHTML = sceneArt(s, sc);
    const cap = $("#preview-caption");
    if (cap) cap.innerHTML = `<div class="who">${esc(s.woman)}</div><div class="line">${esc(sc.vo)}</div>`;
    const label = $("#preview-scene-label");
    if (label) label.textContent = `SCENE ${pad2(sc.n)} / ${pad2(s.scenes.length)}`;
  }
  function updateSceneSelection() {
    $$("[data-scene-item]").forEach((item, i) => {
      const row = $(".scene-row", item);
      if (row) row.classList.toggle("is-selected", i === state.scene);
    });
  }
  function updateOpenScene() {
    $$("[data-scene-item]").forEach((item, i) => {
      const open = state.openScene === i;
      item.classList.toggle("is-open", open);
      const row = $(".scene-row", item);
      if (row) row.setAttribute("aria-expanded", String(open));
    });
  }
  function seekTo(sec) {
    const s = story(state.date);
    if (!s || !s.scenes) return;
    state.playTime = Math.max(0, Math.min(totalDur(s), sec));
    state.scene = sceneAt(s, state.playTime);
    updatePreview();
    updateSceneSelection();
    updatePlayhead();
  }

  /* ------------------------------------------------------------
     actions
     ------------------------------------------------------------ */
  function navigate(hash) {
    if (location.hash === hash) return;
    location.hash = hash;
  }

  function selectDate(date) {
    state.date = date;
    state.weekAutoScroll = true;
    state.scene = 0;
    state.openScene = null;
    state.playTime = 0;
    state.playing = false;
    clearInterval(playTimer);
    if (state.screen === "studio") state.tab = defaultTab(story(date));
    if (state.screen === "calendar") state.calDate = date;
    render();
  }

  function setTab(tab) {
    state.tab = tab;
    state.captionEditing = false;
    state.captionDraft = null;
    stopPlay();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function approve() {
    const s = story(state.date);
    const slot = nextSlot(s);
    s.prevSlot = s.slot;
    s.prevDetail = s.detail;
    if (s.date < D.today) {
      s.slot = slot.time;
      s.detail = "Scheduled · " + slot.time + " IST";
    }
    state.approved.add(s.date);
    state.changes.delete(s.date);
    state.overlay = null;
    document.body.style.overflow = "";
    stopPlay();
    render();
    toast(s.date < D.today ? "Approved. Moved to today, 20:30 IST · commit 3f2a1c." : "Approved. Scheduled for " + s.slot + " IST · commit 3f2a1c.");
  }

  function openRun(index) { openOverlay({ type: "run", index }); }

  function discuss(stage) { openOverlay({ type: "chat", stage }); }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-act]");
    if (!target) {
      if (state.overlay && e.target.classList?.contains("palette-backdrop")) closeOverlay();
      return;
    }
    const act = target.dataset.act;
    if (act === "close-overlay") {
      const isBackdrop = target.classList.contains("drawer-backdrop") || target.classList.contains("palette-backdrop");
      if (isBackdrop && e.target !== target) return;
      e.preventDefault();
      closeOverlay();
      return;
    }
    if (["select-date", "scene", "approve", "changes", "tab", "cal-select", "cal-view", "cal-prev", "cal-next", "cal-today", "filter", "rule-stage", "palette", "palette-pick", "stage", "run", "regen", "revoice", "alternatives", "caption-edit", "caption-save", "caption-cancel", "copy-caption", "copy-script", "confirm-approve", "confirm-changes", "change-chip", "rule-toggle", "rule-source", "rule-chat", "proposal-approve", "proposal-reject", "autopilot", "gate-switch", "alert-switch", "pause-all", "retry", "chat-send", "start-story", "play-preview", "toggle-play", "safe", "undo-approve", "palette-page", "proposal-why", "fix-caption"].includes(act)) {
      e.preventDefault();
    }

    switch (act) {
      case "select-date":
        selectDate(target.dataset.date);
        break;
      case "tab": {
        const tab = target.dataset.tab;
        if (tab) setTab(tab);
        break;
      }
      case "scene": {
        const n = Number(target.dataset.n);
        const current = story(state.date);
        if (current && current.slides && !current.scenes) {
          state.scene = n;
          updateSceneSelection();
          updateSlidePreview();
          break;
        }
        if (state.scene === n) {
          state.openScene = state.openScene === n ? null : n;
          updateOpenScene();
        } else {
          state.scene = n;
          state.openScene = n;
          state.playTime = story(state.date).scenes?.[n]?.start ?? 0;
          updatePreview();
          updateSceneSelection();
          updateOpenScene();
          updatePlayhead();
        }
        break;
      }
      case "toggle-play":
        state.playing ? stopPlay() : startPlay();
        break;
      case "safe":
        state.safe = !state.safe;
        render();
        break;
      case "play-preview":
        state.autoPlay = true;
        navigate(`#/studio/${state.date}`);
        setTimeout(() => { if (state.autoPlay) { state.autoPlay = false; startPlay(); } }, 240);
        break;
      case "approve":
        openOverlay({ type: "approve" });
        break;
      case "confirm-approve":
        approve();
        break;
      case "changes":
        openOverlay({ type: "changes" });
        break;
      case "change-chip": {
        const ta = $("#change-note");
        if (ta) { ta.value = (ta.value ? ta.value + " " : "") + target.dataset.text + "."; ta.focus(); }
        break;
      }
      case "confirm-changes": {
        const note = $("#change-note")?.value.trim();
        if (!note) { toast("Add a note so Hermes knows what to change."); break; }
        state.changes.add(state.date);
        state.approved.delete(state.date);
        state.overlay = null;
        document.body.style.overflow = "";
        render();
        toast("Sent to Hermes. It will re-cut the named scenes and bring the next version back.");
        break;
      }
      case "undo-approve": {
        const s = story(state.date);
        state.approved.delete(state.date);
        if (s && s.prevSlot) {
          s.slot = s.prevSlot;
          s.detail = s.prevDetail;
          delete s.prevSlot;
          delete s.prevDetail;
        }
        render();
        toast("Approval withdrawn. The cut is back on the desk.");
        break;
      }
      case "palette":
        state.paletteQuery = "";
        state.paletteIndex = 0;
        openOverlay({ type: "palette" });
        break;
      case "palette-pick": {
        const date = target.dataset.date;
        closeOverlay();
        navigate(`#/studio/${date}`);
        break;
      }
      case "palette-page": {
        const href = target.getAttribute("href");
        closeOverlay();
        if (href) navigate(href);
        break;
      }
      case "cal-select":
        state.calDate = target.dataset.date;
        render();
        break;
      case "cal-view":
        state.calView = target.dataset.view;
        if (state.calView === "run") state.calStart = weekOf(state.calDate)[0];
        else state.calMonth = state.calDate.slice(0, 7);
        render();
        break;
      case "cal-prev": {
        if (window.innerWidth <= 760) {
          state.calDate = addDays(state.calDate, -7);
          state.calStart = weekOf(state.calDate)[0];
        } else if (state.calView === "run") {
          state.calDate = addDays(state.calDate, -28);
          state.calStart = weekOf(state.calDate)[0];
        } else {
          state.calMonth = addMonths(state.calMonth, -1);
          state.calDate = `${state.calMonth}-01`;
        }
        render();
        break;
      }
      case "cal-next": {
        if (window.innerWidth <= 760) {
          state.calDate = addDays(state.calDate, 7);
          state.calStart = weekOf(state.calDate)[0];
        } else if (state.calView === "run") {
          state.calDate = addDays(state.calDate, 28);
          state.calStart = weekOf(state.calDate)[0];
        } else {
          state.calMonth = addMonths(state.calMonth, 1);
          state.calDate = `${state.calMonth}-01`;
        }
        render();
        break;
      }
      case "cal-today":
        state.calMonth = D.today.slice(0, 7);
        state.calDate = D.today;
        state.calStart = weekOf(D.today)[0];
        render();
        break;
      case "filter":
        state.filter = target.dataset.filter;
        render();
        break;
      case "rule-stage":
        state.ruleStage = target.dataset.stage;
        render();
        break;
      case "rule-toggle": {
        const g = D.gates[Number(target.dataset.index)];
        if (!g || g.state === "owner" || g.state === "locked") break;
        g.state = g.state === "auto" ? "paused" : "auto";
        render();
        toast(g.state === "auto" ? `${g.stage} gate is auto-advancing again.` : `${g.stage} gate paused. Clean work will stop here.`);
        break;
      }
      case "rule-source": {
        const pre = $(`#source-${target.dataset.index}`);
        if (pre) { pre.hidden = !pre.hidden; target.setAttribute("aria-expanded", String(!pre.hidden)); target.textContent = pre.hidden ? "View source" : "Hide source"; }
        break;
      }
      case "rule-chat":
        discuss(D.gates[Number(target.dataset.index)]?.stage || "Draft");
        break;
      case "proposal-approve": {
        const i = D.proposed.findIndex((p) => p.id === target.dataset.id);
        if (i >= 0) {
          const p = D.proposed.splice(i, 1)[0];
          render();
          toast(`Rule updated: “${p.title}”. Commit a91d2e pushed.`);
        }
        break;
      }
      case "proposal-why":
        discuss(target.dataset.stage);
        break;
      case "proposal-reject": {
        const i = D.proposed.findIndex((p) => p.id === target.dataset.id);
        if (i >= 0) { D.proposed.splice(i, 1); render(); toast("Proposal rejected. Nothing changed."); }
        break;
      }
      case "stage":
        openOverlay({ type: "stage", index: Number(target.dataset.index) });
        break;
      case "run":
        openRun(Number(target.dataset.index));
        break;
      case "retry": {
        const s = story(target.dataset.date || "2026-11-21");
        if (s) { s.status = "rendering"; s.detail = "Retrying scene 4"; s.progress = 62; }
        closeOverlay();
        render();
        toast("Retry queued. Hermes picks it up in the next cycle.");
        break;
      }
      case "autopilot":
      case "gate-switch":
      case "alert-switch": {
        const on = target.getAttribute("aria-checked") === "true";
        target.setAttribute("aria-checked", String(!on));
        toast(!on ? "Autonomy updated." : "Paused. Clean work will wait here.");
        break;
      }
      case "pause-all":
        toast("All runs paused. Nothing will advance until you resume.");
        break;
      case "chat-send": {
        const t = $("#chat-text")?.value.trim();
        if (!t) { toast("Type a message first."); break; }
        closeOverlay();
        toast("Sent. The agent replies in a few minutes and proposes the rule change for your approval.");
        break;
      }
      case "regen":
        toast(`Scene ${Number(target.dataset.n) + 1} queued for a visual re-render. The rest of the cut stays.`);
        break;
      case "revoice":
        toast(`Scene ${Number(target.dataset.n) + 1} queued for a new voice take.`);
        break;
      case "alternatives":
        toast("Asked the owning agent for three options. They arrive in the pack, not as a new prompt.");
        break;
      case "caption-edit":
        state.tab = "caption";
        state.captionEditing = true;
        state.captionDraft = captionFor(story(state.date)).caption;
        render();
        requestAnimationFrame(() => $("#caption-editor")?.focus());
        break;
      case "fix-caption": {
        const s = story(state.date);
        state.tab = "caption";
        state.captionEditing = true;
        state.captionDraft = captionFor(s).caption;
        render();
        requestAnimationFrame(() => { const el = $("#caption-editor"); if (el) { el.focus(); el.setSelectionRange(0, (el.value.split("\n")[0] || "").length); } });
        break;
      }
      case "caption-save": {
        const v = $("#caption-editor")?.value.trim();
        let fixed = false;
        let stillOver = false;
        if (v) {
          const s = story(state.date);
          const opening = (v.split("\n")[0] || "").trim();
          stillOver = opening.length > 125;
          state.captions[s.date] = { caption: v, opening };
          if (s.status === "exception" && opening.length <= 125) {
            s.status = "final";
            s.detail = "Final cut · caption fixed";
            s.progress = 92;
            fixed = true;
          }
        }
        state.captionEditing = false;
        state.captionDraft = null;
        render();
        toast(fixed ? "Caption saved. The caption gate passes; the cut is ready for your review." : stillOver ? "Caption saved, but the opening is still over 125. The gate stays paused." : "Caption saved. Commit 8c1f0e pushed.");
        break;
      }
      case "caption-cancel":
        state.captionEditing = false;
        state.captionDraft = null;
        render();
        break;
      case "copy-caption":
        copyText(captionFor(story(state.date)).caption, "Caption copied.");
        break;
      case "copy-script":
        copyText(D.script.vo, "Voiceover copied.");
        break;
      case "start-story":
        toast("Queued for the next Hermes run. The research agent starts with the calendar hook.");
        break;
      default:
        break;
    }
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "palette-input") {
      state.paletteQuery = t.value;
      state.paletteIndex = 0;
      const list = $("#palette-list");
      if (list) list.innerHTML = paletteListHTML();
      return;
    }
    if (t.id === "caption-editor") {
      state.captionDraft = t.value;
      const first = (t.value.split("\n")[0] || "");
      const n = first.length;
      const count = $("#caption-live-count");
      const meter = $("#caption-live-meter");
      const text = $("#caption-live-text");
      if (count) { count.textContent = n + " / 125"; count.classList.toggle("over", n > 125); }
      if (meter) { meter.classList.toggle("over", n > 125); const bar = meter.querySelector("i"); if (bar) bar.style.width = Math.min(100, (n / 125) * 100) + "%"; }
      if (text) text.textContent = first;
      return;
    }
    if (t.dataset.sceneField) {
      const s = story(state.date);
      const i = Number(t.dataset.n);
      if (s && s.scenes && s.scenes[i]) {
        s.scenes[i][t.dataset.sceneField] = t.value;
        if (i === state.scene) updatePreview();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      state.paletteQuery = "";
      state.paletteIndex = 0;
      openOverlay({ type: "palette" });
      return;
    }
    if (e.key === "Escape" && state.overlay) {
      e.preventDefault();
      closeOverlay();
      return;
    }
    if (state.overlay?.type !== "palette") {
      const inField = ["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.isContentEditable;
      if (!inField && e.code === "Space" && state.screen === "studio" && state.tab === "cut") {
        e.preventDefault();
        state.playing ? stopPlay() : startPlay();
      }
      return;
    }
    const items = $$(".palette-item");
    if (e.key === "ArrowDown") { e.preventDefault(); state.paletteIndex = Math.min(items.length - 1, state.paletteIndex + 1); $$(".palette-item").forEach((el, i) => el.classList.toggle("is-active", i === state.paletteIndex)); }
    if (e.key === "ArrowUp") { e.preventDefault(); state.paletteIndex = Math.max(0, state.paletteIndex - 1); $$(".palette-item").forEach((el, i) => el.classList.toggle("is-active", i === state.paletteIndex)); }
    if (e.key === "Enter") {
      const el = items[state.paletteIndex];
      if (el) { e.preventDefault(); el.click(); }
    }
  });

  document.addEventListener("click", (e) => {
    const w = e.target.closest("#wave");
    if (!w) return;
    const s = story(state.date);
    if (!s || !s.scenes) return;
    const r = w.getBoundingClientRect();
    seekTo(((e.clientX - r.left) / r.width) * totalDur(s));
  });
  document.addEventListener("keydown", (e) => {
    const w = e.target.closest?.("#wave");
    if (!w) return;
    const s = story(state.date);
    if (!s || !s.scenes) return;
    if (e.key === "ArrowRight") { e.preventDefault(); seekTo(state.playTime + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(state.playTime - 1); }
  });

  /* ------------------------------------------------------------
     routing
     ------------------------------------------------------------ */
  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    const p = path.split("/").filter(Boolean);
    stopPlay();
    state.overlay = null;
    document.body.style.overflow = "";
    if (!p.length || p[0] === "desk") {
      state.screen = "desk";
    } else if (p[0] === "studio") {
      state.screen = "studio";
      state.date = story(p[1]) ? p[1] : D.focus;
      const tab = p[2];
      const valid = ["cut", "script", "caption", "facts", "history", "slides"];
      state.tab = valid.includes(tab) ? tab : defaultTab(story(state.date));
      const sceneParam = Number(params.get("scene"));
      state.scene = Number.isFinite(sceneParam) && sceneParam > 0 ? sceneParam - 1 : 0;
      const slideParam = Number(params.get("slide"));
      if (Number.isFinite(slideParam) && slideParam > 0) { state.scene = slideParam - 1; state.tab = "slides"; }
      state.openScene = null;
      state.playTime = story(state.date).scenes?.[state.scene]?.start || 0;
      state.autoPlay = params.get("play") === "1";
    } else if (p[0] === "calendar") {
      state.screen = "calendar";
    } else if (p[0] === "runs") {
      state.screen = "runs";
    } else if (p[0] === "rules") {
      state.screen = "rules";
      const groups = ruleGroups();
      state.ruleStage = Object.keys(groups).find((k) => k.toLowerCase() === (p[1] || "").toLowerCase()) || "Draft";
    } else {
      state.screen = "desk";
    }
    render();
    window.scrollTo(0, 0);
    if (state.autoPlay) {
      state.autoPlay = false;
      setTimeout(startPlay, 280);
    }
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("resize", () => {
    if (state.screen === "calendar") render();
  });

  /* ------------------------------------------------------------
     start
     ------------------------------------------------------------ */
  if (!location.hash) location.replace("#/desk");
  route();
})();
