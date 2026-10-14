/* ---------------------------------------------------------------------
   SAVED PASSCODES — read first, before anything else in this file.
   localStorage 'sister_pin' / 'admin_pin' win; the defaults (2008 / 9999) are used
   ONLY when the key is null (never saved). A value may be the 4 digits themselves or
   the hash this app writes when a passcode is changed in the Controller.
   --------------------------------------------------------------------- */
let LS_SISTER_PIN = null, LS_ADMIN_PIN = null;
try { LS_SISTER_PIN = localStorage.getItem("sister_pin"); LS_ADMIN_PIN = localStorage.getItem("admin_pin"); } catch (e) { /* storage blocked */ }

/* =====================================================================
   PROJECT LITTLE STAR v2.1 — GHIBLI & SPACE FINALE EDITION
   (Sister mode + hidden Brother/Admin controller)

   Where things live
   - DEFAULTS (below) = the content that ships in the ZIP.
   - The Admin controller saves overrides to localStorage (this browser only).
     Use Controller > Backup > "Copy update link" to move edits to Priya's phone.
   - Every storage key is prefixed "priya-birthday-v2:" so this app can't touch
     other apps (e.g. ChronoPulse) that share the same username.github.io origin.
   - Passcodes: Priya = 2008, Admin = 9999 (both changeable in the controller).
     The app asks for Priya's passcode on EVERY open. Tap the top-left star
     3 times in a row to get the admin passcode prompt.
   ===================================================================== */

const NS = "priya-birthday-v2:";
const OLD_NS = "priya-birthday-v1:";          // v1 edits are carried over once (see loadConfig)
const KEY_CFG = NS + "cfg";

const DEFAULT_SISTER_PIN = "2008";   // Priya's birth year
const DEFAULT_ADMIN_PIN = "9999";    // first-time controller passcode — change it in Controller > Passcodes

const DEFAULTS = {
  hintStart: "4 digits podu, chellam 🔐",
  hintWrong: "Aiyo, thappu code! 🙈 Clue: nee pirantha year 😉",
  hintRight: "Yay! Unlocked 🎉",

  /* Shown on the surprise card when the rocket reaches the moon. One line = one paragraph. */
  wish: "Un wish-a rocket-la ethi, moon-kitte anuppitten! 🚀🌕\nUn life full-ah light, laughter & lovely surprises irukkattum.\nUn kanavu ellam nijamaaganum — adhukku Annan eppovum un pinnaadi irupen.\nHappy 18th, my Little Star! ⭐",

  /* 10 photos (photo1.jpg … photo10.jpg) + 1 video (video1.mp4) = 11 captions */
  captions: [
    "Intha face-ah paaru 😂 epovum drama queen!",
    "Namma first trip — nee thookam, naan driver 🚗",
    "Sandai pottom, aprm ice cream sapdom 🍦",
    "Exam time: panic mode ON 📚",
    "Selfie-ku pose kudukkura expert 🤳",
    "Amma kitta thittu vaangunathu — same pinch 😅",
    "Festival day, new dress, full attitude ✨",
    "Un chinna vayasu cuteness 🥹",
    "Late night talks, early morning regrets 🌙",
    "Always my little star ⭐",
    "Intha video-va paaru 🎬 — full comedy!"
  ],

  /* 4 questions. Options are shuffled on screen. `right` = index (0-based) in `a` of the correct answer. */
  quiz: [
    { q: "Veetla remote use panra remote controller yaaru?",
      a: ["Priya", "Appa", "Amma", "Vaasu"], right: 0,
      good: "Correct-u! Remote eppovum un kaiyila thaan 📺", bad: "Hehe… remote-ah vechirukkura aal vera 😜 try again" },
    { q: "Veetla vela ethuvum seyyama phone paakurathu yaaru?",
      a: ["Priya", "Appa", "Amma", "Vaasu"], right: 0,
      good: "Pidichittiye! Phone thaan un best friend 📱", bad: "Illa da… yaaru phone-la moozhgi irukka? 🙈" },
    { q: "Vaasu va decorate panni photo edukurathu yaaru?",
      a: ["Priya", "Appa", "Amma", "Vaasu"], right: 0,
      good: "Yes! Vaasu-ku nee thaan stylist 💅📸", bad: "Hmm… camera yaar kitta irukku? 😏" },
    { q: "Appavoda chellam yaaru?",
      a: ["Priya", "Appa", "Amma", "Vaasu"], right: 0,
      good: "Aww! Appavoda chellam nee thaan 🥰", bad: "Sari, Appa kitta kettu paaru 😂" }
  ],

  /* The Tamil letter. One entry = one paragraph. The last entry is the sign-off. */
  letter: [
    "என் செல்லத் தங்கை பிரியா தர்ஷினிக்கு,",
    "இனிய பதினெட்டாம் பிறந்தநாள் நல்வாழ்த்துகள், என் குட்டி நட்சத்திரமே! ⭐ நேற்றுதான் தத்தித் தத்தி நடந்த சின்னப் பாப்பா, இன்று பதினெட்டு வயது நிரம்பிய இளம்பெண்ணாக நிற்பதை என்னால் நம்பவே முடியவில்லை.",
    "வீட்டில் ரிமோட் யார் கையில் இருக்கும் என்று கேட்டால், கண்ணை மூடிக்கொண்டும் சொல்லிவிடுவேன் — அது உன் கையில்தான்! 📺 வேலை எதுவும் செய்யாமல் கைப்பேசியையே பார்த்துக்கொண்டிருக்கும் உன்னை முறைப்பது போல் நடிப்பேன்; ஆனால் உள்ளுக்குள் அந்தக் குறும்புச் சிரிப்பை ரசித்துக்கொண்டிருப்பேன்.",
    "வாசுவுக்கு அழகழகாக அலங்காரம் செய்து, அதைப் படம் பிடிக்கும் உன் கலைநயம் எனக்குப் பெரிய வியப்பு. அப்பாவின் செல்லம் நீதான் என்பதை அவர் வாய்விட்டுச் சொல்லாவிட்டாலும், அவர் கண்களே சொல்லிவிடும்.",
    "நீ எவ்வளவு குறும்பு செய்தாலும், இந்த வீட்டின் மகிழ்ச்சி உன் சிரிப்பில்தான் இருக்கிறது. நீ இல்லாத வீடு அமைதியாக இருக்கலாம்; ஆனால் அழகாக இருக்காது.",
    "இன்று முதல் நீ பதினெட்டு வயதுப் பெண். உன் கனவுகளுக்குச் சிறகுகள் முளைத்துவிட்டன. நன்றாகப் படி, மனம்விட்டுச் சிரி, பெரிதாகச் சாதி. தடுமாறினாலும் தயங்காதே — உன்னைத் தாங்கிப்பிடிக்க இந்த அண்ணன் எப்போதும் உன் பின்னால் இருப்பேன்.",
    "பிறந்தநாள் கேக்கை வெட்டும்போது, எனக்கும் ஒரு பெரிய துண்டு எடுத்து வைக்க மறந்துவிடாதே! 🎂😄",
    "என்றும் உன் அன்பு அண்ணன் 💖"
  ]
};

const MEDIA = {
  photoCount: 10,
  photo: n => `./assets/photos/photo${n}.jpg`,
  video: "./assets/videos/video1.mp4",
  audio: "./assets/audio/bg-music.mp3"
};
const CAPTION_COUNT = MEDIA.photoCount + 1;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLORS = ["#f9d3e3", "#e98bb4", "#dccbf7", "#b79bec", "#f2b84b", "#ffe08a", "#ffffff", "#8fd6c8", "#ffd36b"];

function el(tag, props = {}, kids = []) {
  const n = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "text") n.textContent = v;
    else if (k === "class") n.className = v;
    else if (k.startsWith("data-")) n.setAttribute(k, v);
    else n[k] = v;
  });
  [].concat(kids).forEach(c => c && n.append(c));
  return n;
}

/* ---------------------------------------------------------------------
   Storage (always guarded — storage can be unavailable in private mode)
   --------------------------------------------------------------------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* A playful lock, not real security: PINs are stored as a hash so they are not
   sitting in plain sight in localStorage, but the defaults are in this file. */
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
const hashPin = pin => cyrb53("littlestar|" + pin).toString(36);
const isHash = s => typeof s === "string" && /^[0-9a-z]{6,16}$/.test(s);
const isPin = s => /^\d{4}$/.test(s);

/* base64url <-> UTF-8 (for backup codes / update links) */
function b64e(str) {
  let bin = "";
  new TextEncoder().encode(str).forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64d(code) {
  let s = code.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

/* ---------------------------------------------------------------------
   Config = DEFAULTS + whatever the admin saved. sanitize() makes sure
   a broken/edited blob can never break the app.
   --------------------------------------------------------------------- */
const clone = o => JSON.parse(JSON.stringify(o));
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* A media path must be an https:// link or a relative path inside this app. Anything else
   (javascript:, data:, http:, ../ tricks) falls back. Relative paths are normalised to "./…"
   so they keep working from a GitHub Pages sub-folder. */
function cleanPath(v, fallback) {
  let p = typeof v === "string" ? v.trim() : "";
  if (!p || p.length > 300) return fallback;
  if (/^https:\/\/[^\s"'<>\\]+$/i.test(p)) return p;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p) || p.startsWith("//")) return fallback;
  p = p.replace(/^(\.\/|\/)+/, "");
  if (!p || p.split("/").includes("..") || !/^[\w\-./%~@+ ()]+$/.test(p)) return fallback;
  return "./" + p;
}

function sanitize(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const out = { v: 2 };

  out.sisterHash = isHash(r.sisterHash) ? r.sisterHash : hashPin(DEFAULT_SISTER_PIN);
  out.adminHash = isHash(r.adminHash) ? r.adminHash : hashPin(DEFAULT_ADMIN_PIN);

  const rm = r.media && typeof r.media === "object" ? r.media : {};
  out.media = {
    photos: Array.from({ length: MEDIA.photoCount }, (_, i) =>
      cleanPath(Array.isArray(rm.photos) ? rm.photos[i] : "", MEDIA.photo(i + 1))),
    video: cleanPath(rm.video, MEDIA.video),
    audio: cleanPath(rm.audio, MEDIA.audio)
  };
  out.wish = str(r.wish, 700) || DEFAULTS.wish;

  out.captions = DEFAULTS.captions.map((d, i) => {
    const s = Array.isArray(r.captions) ? str(r.captions[i], 160) : "";
    return s || d;
  });

  out.quiz = DEFAULTS.quiz.map((d, i) => {
    const q = Array.isArray(r.quiz) ? r.quiz[i] : null;
    if (!q || typeof q !== "object") return clone(d);
    const a = Array.isArray(q.a) ? q.a.slice(0, 4).map(x => str(x, 80)) : [];
    const right = Number.isInteger(q.right) ? q.right : -1;
    const ok = str(q.q, 200) && a.length === 4 && a.every(Boolean) && right >= 0 && right < 4;
    if (!ok) return clone(d);
    return { q: str(q.q, 200), a, right, good: str(q.good, 120) || d.good, bad: str(q.bad, 120) || d.bad };
  });

  const letter = Array.isArray(r.letter) ? r.letter.map(x => str(x, 1200)).filter(Boolean) : [];
  out.letter = letter.length >= 2 ? letter.slice(0, 30) : DEFAULTS.letter.slice();
  return out;
}

function loadConfig() {
  let raw = store.get(KEY_CFG);
  if (!raw) {                                         // first run of v2: carry over anything saved by v1
    const old = store.get(OLD_NS + "cfg");
    if (old) {
      try { const cfg = sanitize(JSON.parse(old)); store.set(KEY_CFG, JSON.stringify(cfg)); return cfg; } catch (e) {}
    }
    return sanitize(null);
  }
  try { return sanitize(JSON.parse(raw)); } catch (e) { return sanitize(null); }
}
/* Saved passcodes override whatever is in the config blob (and the defaults). */
function pinToHash(v) {
  if (v === null || v === undefined) return null;
  if (isPin(v)) return hashPin(v);
  return isHash(v) ? v : null;
}
function applySavedPins(cfg) {
  const sh = pinToHash(LS_SISTER_PIN), ah = pinToHash(LS_ADMIN_PIN);
  if (sh) cfg.sisterHash = sh;
  if (ah && ah !== cfg.sisterHash) cfg.adminHash = ah;
  return cfg;
}
/* Write both passcodes to their own keys and read them back to be sure they stuck. */
function persistPins(cfg) {
  const a = store.set("sister_pin", cfg.sisterHash), b = store.set("admin_pin", cfg.adminHash);
  LS_SISTER_PIN = store.get("sister_pin");
  LS_ADMIN_PIN = store.get("admin_pin");
  return a && b && LS_SISTER_PIN === cfg.sisterHash && LS_ADMIN_PIN === cfg.adminHash;
}
function saveConfig() {
  const ok = store.set(KEY_CFG, JSON.stringify(CFG)) && persistPins(CFG);
  if (!ok) toast("⚠ Couldn't save on this browser (storage blocked or private mode)", 4200);
  return ok;
}

/* An update link looks like  …/index.html#cfg=CODE  — import it silently, then tidy the address bar. */
function importFromHash() {
  const m = /^#cfg=([\w-]+)$/.exec(location.hash);
  if (!m) return;
  try {
    const next = sanitize(JSON.parse(b64d(m[1])));
    store.set(KEY_CFG, JSON.stringify(next));
    persistPins(next);                               // keep the read-first passcode keys in step with the link
  } catch (e) { /* ignore a damaged link */ }
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
}

importFromHash();
let CFG = applySavedPins(loadConfig());
persistPins(CFG);                                  // first run writes the defaults once; later runs just re-confirm

/* ---------------------------------------------------------------------
   Toast
   --------------------------------------------------------------------- */
let toastTimer = 0;
function toast(msg, ms = 2200) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

/* ---------------------------------------------------------------------
   Floating gold star particles (background)
   --------------------------------------------------------------------- */
(function makeStars() {
  const box = $("#stars");
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("i");
    s.textContent = i % 4 ? "✦" : "★";
    s.style.cssText =
      `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
      `font-size:${8 + Math.random() * 16}px;--d:${4 + Math.random() * 4}s;` +
      `animation-delay:${-Math.random() * 6}s`;
    box.appendChild(s);
  }
})();

/* ---------------------------------------------------------------------
   Particle canvas: gold star sparkles + built-in confetti (fallback)
   --------------------------------------------------------------------- */
const fx = $("#fx");
const ctx = fx.getContext("2d");
let W = 0, H = 0, parts = [], raf = 0;

function fit() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  fx.width = W * dpr; fx.height = H * dpr;
  fx.style.width = W + "px"; fx.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", fit);
fit();

/* x,y are fractions of the screen (0..1) */
function burst(n, x = .5, y = .5, o = {}) {
  n = REDUCED ? Math.ceil(n * .25) : n;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (o.speed || 8) * (.4 + Math.random());
    parts.push({
      x: x * W, y: y * H,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0),
      g: o.gravity ?? .22,
      r: 4 + Math.random() * 7,
      c: COLORS[i % COLORS.length],
      star: Math.random() < (o.stars ?? .4),
      rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
      life: 1, decay: .006
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

/* soft smoke puff + tiny gold spark (used by the rocket's exhaust). x,y are in pixels. */
function puff(x, y, size = 8) {
  parts.push({ x, y, vx: (Math.random() - .5) * .8, vy: .5 + Math.random() * .8, g: 0, r: size, c: "#fff6e6",
               kind: "puff", alpha: .6, rot: 0, vr: 0, life: 1, decay: .024 });
  if (!raf) raf = requestAnimationFrame(tick);
}
function spark(x, y) {
  parts.push({ x, y, vx: (Math.random() - .5) * 1.6, vy: Math.random() * 1.4, g: .02, r: 3 + Math.random() * 3, c: "#ffe08a",
               star: true, rot: 0, vr: .12, life: 1, decay: .02 });
  if (!raf) raf = requestAnimationFrame(tick);
}

function drawStar(c, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const R = i % 2 ? r * .45 : r, a = i * Math.PI / 5 - Math.PI / 2;
    c.lineTo(Math.cos(a) * R, Math.sin(a) * R);
  }
  c.closePath(); c.fill();
}

function tick() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life > 0 && p.y < H + 40);
  for (const p of parts) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy;
    p.vx *= .99; p.rot += p.vr; p.life -= p.decay || .006;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(p.life, 0) * (p.alpha || 1); ctx.fillStyle = p.c;
    if (p.kind === "puff") { ctx.beginPath(); ctx.arc(0, 0, p.r * (1 + (1 - p.life) * 1.8), 0, 6.2832); ctx.fill(); }
    else if (p.star) drawStar(ctx, p.r); else ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .6);
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!raf) ctx.clearRect(0, 0, W, H);
}

/* gentle falling stars for a few seconds */
function starRain(ms) {
  const end = Date.now() + ms;
  (function f() {
    burst(3, Math.random(), -.05, { speed: 2, stars: .8, gravity: .08 });
    if (Date.now() < end) setTimeout(f, 110);
  })();
}

/* ---------------------------------------------------------------------
   Canvas Confetti (library) with a built-in fallback
   --------------------------------------------------------------------- */
const hasLib = () => typeof window.confetti === "function";

function confettiPop(count = 60, origin = { x: .5, y: .65 }) {
  if (hasLib()) {
    window.confetti({
      particleCount: count, spread: 75, startVelocity: 38, origin,
      colors: COLORS, shapes: ["star", "circle", "square"],
      zIndex: 92, disableForReducedMotion: true
    });
  } else {
    burst(count, origin.x, origin.y, { speed: 9, up: 3, stars: .5 });
  }
}

function confettiBlast() {
  if (hasLib() && !REDUCED) {
    const end = Date.now() + 3200;
    const base = { colors: COLORS, shapes: ["star", "circle", "square"], zIndex: 92, disableForReducedMotion: true };
    window.confetti({ ...base, particleCount: 180, spread: 110, startVelocity: 55, origin: { x: .5, y: .62 } });
    (function frame() {
      window.confetti({ ...base, particleCount: 5, angle: 60,  spread: 62, startVelocity: 58, origin: { x: 0, y: .75 } });
      window.confetti({ ...base, particleCount: 5, angle: 120, spread: 62, startVelocity: 58, origin: { x: 1, y: .75 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } else {
    burst(220, .5, .55, { speed: 14, up: 4, stars: .5 });
    setTimeout(() => burst(120, .15, .8, { speed: 12, up: 8 }), 250);
    setTimeout(() => burst(120, .85, .8, { speed: 12, up: 8 }), 450);
  }
  starRain(3200);
}

/* ---------------------------------------------------------------------
   Screen navigation (slide transitions)
   --------------------------------------------------------------------- */
const screens = $$(".screen");
let current = 0, moving = false, unlocked = false, navToken = 0;

/* setTimeout that silently does nothing if the app was re-locked in the meantime */
const later = (fn, ms) => { const t = navToken; return setTimeout(() => { if (t === navToken) fn(); }, ms); };

function go(n) {
  if (n === current || moving) return;
  if (n !== 0 && !unlocked) return;                  // nothing past the lock screen without the passcode
  const from = screens[current], to = screens[n], t = navToken;
  moving = true;
  pauseVideos();
  from.classList.add("leaving");
  to.classList.add("active", "entering");
  current = n;
  window.scrollTo(0, 0);
  updateMusicPill();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});   // ask the browser not to evict saved settings
  setTimeout(() => {
    if (t !== navToken) return;
    from.classList.remove("active", "leaving");
    to.classList.remove("entering");
    moving = false;
  }, REDUCED ? 20 : 480);
  if (n === 2) syncRail();
  if (n === 3) startQuiz();
  if (n === 4) { setSpace(true); resetCake(); }
}

/* ---------------------------------------------------------------------
   Music — plays ./assets/audio/bg-music.mp3. If that file is missing or
   can't play, a music-box "Happy Birthday" is synthesised in the browser
   instead, so there is always sound. Starts only after a tap (autoplay rules).
   --------------------------------------------------------------------- */
const Music = (() => {
  const F = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88,
              C2: 523.25, D2: 587.33, E2: 659.25, F2: 698.46, G2: 783.99 };
  const TUNE = [
    ["G", .75], ["G", .25], ["A", 1], ["G", 1], ["C2", 1], ["B", 2],
    ["G", .75], ["G", .25], ["A", 1], ["G", 1], ["D2", 1], ["C2", 2],
    ["G", .75], ["G", .25], ["G2", 1], ["E2", 1], ["C2", 1], ["B", 1], ["A", 1],
    ["F2", .75], ["F2", .25], ["E2", 1], ["C2", 1], ["D2", 1], ["C2", 2]
  ];
  const BEAT = .52, VOL = .85, SYN = .9;
  let audio = null, ac = null, master = null, timer = 0, fadeT = 0, on = false, synthOn = false, want = 1;

  function note(freq, t, dur) {
    [[1, .13], [2, .04]].forEach(([mult, vol]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + .015);
      g.gain.exponentialRampToValueAtTime(.0008, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + .05);
    });
  }
  function loop() {
    let t = ac.currentTime + .08;
    TUNE.forEach(([n, beats]) => { note(F[n], t, beats * BEAT * 1.6); t += beats * BEAT; });
    timer = setTimeout(loop, Math.max(500, (t - ac.currentTime + 1.4) * 1000));
  }
  async function startSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { toast("Music-ku intha browser support pannala 😅"); on = false; ui(); return; }
    ac = ac || new AC();
    try { if (ac.state === "suspended") await ac.resume(); } catch (e) {}
    if (!on) return;
    master = ac.createGain();
    master.gain.value = SYN * want;
    master.connect(ac.destination);
    synthOn = true;
    loop();
  }
  function stopSynth() {
    synthOn = false;
    clearTimeout(timer);
    if (master) {
      const m = master;
      m.gain.setTargetAtTime(0, ac.currentTime, .04);
      setTimeout(() => { try { m.disconnect(); } catch (e) {} }, 350);
      master = null;
    }
  }

  /* volume 0..1, optionally faded over `ms` (works for the mp3 and for the synth fallback) */
  function level(frac, ms = 0) {
    want = frac;
    clearInterval(fadeT);
    if (audio) {
      if (!ms) audio.volume = VOL * frac;
      else {
        const from = audio.volume, to = VOL * frac, t0 = performance.now();
        fadeT = setInterval(() => {
          const k = Math.min(1, (performance.now() - t0) / ms);
          audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
          if (k === 1) clearInterval(fadeT);
        }, 50);
      }
    }
    if (master && ac) master.gain.setTargetAtTime(SYN * frac, ac.currentTime, ms ? ms / 3000 : .02);
  }

  /* start(true) = begin silently inside the user's tap (browsers only allow audio to start from a tap),
     then reveal() fades the sound in later, when the surprise card opens. */
  async function start(silent = false) {
    if (on) return;
    on = true;
    want = silent ? 0 : 1;
    ui();
    if (!audio) {
      audio = new Audio(CFG.media.audio);
      audio.loop = true;
      audio.preload = "auto";
    }
    audio.muted = silent;
    audio.volume = VOL * want;
    try { await audio.play(); }
    catch (e) { if (on) startSynth(); }       // file missing / offline / blocked -> synth fallback
  }
  function reveal(ms = 2200) {
    if (!on) return;
    if (audio) audio.muted = false;
    level(1, ms);
  }
  function stop() {
    on = false;
    clearInterval(fadeT);
    if (audio) { audio.pause(); audio.muted = false; }
    stopSynth();
    ui();
  }
  function reset() { stop(); audio = null; }       // forget the audio element (used when the music path changes)
  function ui() {
    const b = $("#music");
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", on ? "Pause music" : "Play music");
    $(".music-icon", b).textContent = on ? "❚❚" : "▶";
    b.classList.remove("nudge");
    const w = $("#wishMusic");
    if (w) { w.setAttribute("aria-pressed", on ? "true" : "false"); w.textContent = on ? "🎵 Music on" : "🎵 Music off"; }
  }
  return { toggle: () => (on ? stop() : start()), start, reveal, stop, reset, get on() { return on; } };
})();

function updateMusicPill() {
  const b = $("#music");
  b.hidden = current < 1;
  if (current === 1 && !Music.on) b.classList.add("nudge");
}
$("#music").addEventListener("click", () => Music.toggle());
document.addEventListener("visibilitychange", () => { if (document.hidden && Music.on) Music.stop(); });

/* ---------------------------------------------------------------------
   Screen 1 — passcode (Priya's passcode unlocks; the admin controller is opened with the star, never from here)
   --------------------------------------------------------------------- */
let entry = "", locked = false;

(function buildPad() {
  const pad = $("#pad");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].forEach(k => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = k;
    if (!k) { b.className = "blank"; b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); }
    if (k === "⌫") { b.className = "del"; b.setAttribute("aria-label", "Delete last digit"); }
    if (k) b.addEventListener("click", () => {
      const now = performance.now();               // a single touch must never count twice
      if (pad._last && pad._last.k === k && now - pad._last.t < 90) return;
      pad._last = { k, t: now };
      press(k);
    });
    pad.appendChild(b);
  });
})();

function paintDots() {
  $$("#dots i").forEach((d, i) => d.classList.toggle("on", i < entry.length));
  $("#dots").setAttribute("aria-label", `${entry.length} of 4 digits entered`);
}

function press(k) {
  if (locked || current !== 0 || modalOpen()) return;
  if (k === "⌫") entry = entry.slice(0, -1);
  else if (entry.length < 4) entry += k;
  paintDots();
  if (entry.length < 4) return;

  const h = hashPin(entry);

  if (h === CFG.sisterHash) {                       // ---- Sister mode (asked again on every app open)
    locked = true;
    unlocked = true;
    $("#hint").textContent = DEFAULTS.hintRight;
    burst(60, .5, .4, { stars: .8, speed: 7 });
    setTimeout(() => go(1), 750);
    return;
  }
  locked = true;                                    // ---- wrong
  const card = $("#lockCard");
  card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  $("#hint").textContent = DEFAULTS.hintWrong;
  if (navigator.vibrate) navigator.vibrate(120);
  setTimeout(() => { entry = ""; paintDots(); locked = false; card.classList.remove("shake"); }, 600);
}

document.addEventListener("keydown", e => {
  if (current !== 0 || modalOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (/^[0-9]$/.test(e.key)) press(e.key);
  else if (e.key === "Backspace") press("⌫");
});

/* ---------------------------------------------------------------------
   Screen 2 — envelope: untie the ribbon, then open the flap
   --------------------------------------------------------------------- */
$("#env").addEventListener("click", () => {
  const env = $("#env");
  if (env.classList.contains("untie")) return;
  env.classList.add("untie");
  env.disabled = true;
  $("#envHint").textContent = "Aww… ✨";
  const r = env.getBoundingClientRect();
  const cx = (r.left + r.width / 2) / window.innerWidth, cy = (r.top + r.height / 2) / window.innerHeight;
  burst(40, cx, cy, { stars: .8, speed: 6, up: 2 });
  later(() => {                                       // ribbon is off -> flap opens
    env.classList.add("open");
    burst(70, cx, cy, { stars: .8, speed: 8, up: 2 });
  }, REDUCED ? 30 : 700);
  later(() => burst(50, cx, cy - .05, { stars: .9, speed: 6, up: 3 }), REDUCED ? 60 : 1150);
  later(() => go(2), REDUCED ? 200 : 2500);
});
function resetEnvelope() {
  const env = $("#env");
  env.classList.remove("untie", "open");
  env.disabled = false;
  $("#envHint").textContent = "tap tap tap 👆";
}

/* ---------------------------------------------------------------------
   Screen 3 — memories carousel: 10 photos + 1 video, graceful fallbacks
   --------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   Ghibli-style painted placeholder cards (original SVG scenery — no film characters).
   Shown for any photo/video slot whose file is missing or still loading.
   --------------------------------------------------------------------- */
const Ghibli = (() => {
  const R = seed => { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; };
  const cl = f => `<circle cx="-34" cy="6" r="18" fill="${f}"/><circle cx="-10" cy="-8" r="26" fill="${f}"/><circle cx="20" cy="-2" r="21" fill="${f}"/><circle cx="42" cy="8" r="13" fill="${f}"/><rect x="-52" y="6" width="106" height="16" rx="8" fill="${f}"/>`;
  const cloud = (x, y, k = 1, o = {}) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><g class="g-drift${o.slow ? " slow" : ""}"><g transform="translate(0 7)">${cl(o.shade || "#cfe0ef")}</g>${cl(o.fill || "#fff")}</g></g>`;
  const sky = (id, stops) =>
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs><rect width="300" height="400" fill="url(#${id})"/>`;
  const hill = (d, f) => `<path d="${d}" fill="${f}"/>`;
  const tree = (x, y, k, a, b) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-4" y="-6" width="8" height="32" rx="3" fill="#7a5238"/><circle cx="0" cy="-26" r="26" fill="${a}"/><circle cx="-15" cy="-14" r="16" fill="${a}"/><circle cx="16" cy="-16" r="18" fill="${a}"/><circle cx="-6" cy="-34" r="13" fill="${b}" opacity=".75"/></g>`;
  const dots = (seed, n, x0, x1, y0, y1, cols, rMin = 1.6, rMax = 3.2) => {
    const r = R(seed); let o = "";
    for (let i = 0; i < n; i++) o += `<circle cx="${(x0 + r() * (x1 - x0)).toFixed(1)}" cy="${(y0 + r() * (y1 - y0)).toFixed(1)}" r="${(rMin + r() * (rMax - rMin)).toFixed(1)}" fill="${cols[i % cols.length]}"/>`;
    return o;
  };
  const stars = (seed, n, h) => `<g class="g-twinkle" fill="#fff">${dots(seed, n, 6, 294, 6, h, ["#fff", "#fff4cf"], .7, 1.8)}</g>`;
  const sunflower = (x, y, k) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-2" y="0" width="4" height="64" fill="#4aa05a"/><ellipse cx="9" cy="40" rx="10" ry="4.5" transform="rotate(-25 9 40)" fill="#5cb86a"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-17" rx="5" ry="11" fill="#ffd23f" transform="rotate(${i * 30})"/>`).join("")}<circle r="11" fill="#7a4b2a"/><circle r="6" fill="#5e371e"/></g>`;
  const lantern = (x, y, k, d) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><g class="g-bob" style="animation-delay:${d}s"><ellipse rx="30" ry="34" fill="#ffcf7a" opacity=".28"/><rect x="-10" y="-13" width="20" height="26" rx="8" fill="#ffb957"/><rect x="-6" y="-9" width="12" height="18" rx="5" fill="#fff0b8" opacity=".9"/><path d="M0 13 V26" stroke="#ffd9a0" stroke-width="1.5"/></g></g>`;
  const house = (x, y, k, wall, roof, win) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-22" y="-26" width="44" height="30" fill="${wall}"/><polygon points="-29,-26 0,-52 29,-26" fill="${roof}"/><rect x="12" y="-50" width="8" height="16" fill="${roof}"/><rect x="-14" y="-18" width="11" height="11" rx="2" fill="${win}"/><rect x="4" y="-12" width="10" height="16" rx="5" fill="#7a5238"/></g>`;
  const smoke = (x, y) => `<g transform="translate(${x} ${y})"><circle class="g-smoke" r="5" fill="#fff"/><circle class="g-smoke" r="5" fill="#fff"/><circle class="g-smoke" r="5" fill="#fff"/></g>`;
  const waves = (y, n, col) => Array.from({ length: n }, (_, i) => `<path d="M${(i * 83) % 260 + 8} ${y + i * 19} q8 -7 16 0 t16 0 t16 0 t16 0" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>`).join("");

  const scenes = [
    /* 0 meadow + big cumulus */ id =>
      sky(id, [[0, "#68baf0"], [.6, "#bde5f8"], [1, "#eaf8ee"]]) + cloud(90, 112, 1.5) + cloud(232, 70, .9, { slow: 1 }) + cloud(214, 196, .78) +
      hill("M0 262 Q70 214 150 246 T300 228 V400 H0Z", "#a6d98a") + hill("M0 300 Q90 256 190 288 T300 276 V400 H0Z", "#74c466") +
      tree(214, 262, .9, "#3f9a52", "#6fc46a") + hill("M0 345 Q110 302 210 334 T300 322 V400 H0Z", "#52ad5b") +
      `<path d="M150 400 Q168 360 208 338" stroke="#f4e6bf" stroke-width="12" fill="none" stroke-linecap="round"/>` + dots(11, 26, 6, 294, 346, 394, ["#fff", "#ffe27a", "#ffb3cf"]),
    /* 1 cottage + chimney smoke */ id =>
      sky(id, [[0, "#8ccfee"], [1, "#fdeccf"]]) + cloud(70, 96, 1.2) + cloud(238, 150, .8, { slow: 1 }) +
      hill("M0 270 Q80 226 170 258 T300 244 V400 H0Z", "#a5d684") + hill("M0 316 Q100 274 200 304 T300 292 V400 H0Z", "#7cc46a") +
      house(176, 292, 1.35, "#fff0d6", "#d9594c", "#ffe08a") + smoke(212, 214) + tree(60, 300, .8, "#3f9a52", "#6fc46a") +
      hill("M0 356 Q120 322 220 350 T300 342 V400 H0Z", "#5aae5c") + dots(21, 30, 6, 294, 356, 396, ["#ffb3cf", "#fff", "#ffe27a"]),
    /* 2 sea + sailboat */ id =>
      sky(id, [[0, "#86d0f0"], [1, "#e9f7fb"]]) + cloud(80, 100, 1.4) + cloud(236, 160, .85, { slow: 1 }) +
      `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0e2"/><stop offset="1" stop-color="#2f93bd"/></linearGradient></defs><rect y="236" width="300" height="164" fill="url(#${id}s)"/>` +
      waves(262, 6, "#fff") + `<g transform="translate(150 272)"><g class="g-bob"><path d="M-44 0 H44 L30 20 H-30Z" fill="#8a5a3c"/><rect x="-2" y="-84" width="4" height="84" fill="#6b4a35"/><polygon points="-4,-80 -4,-8 -40,-8" fill="#fff"/><polygon points="4,-70 4,-8 32,-8" fill="#ffe9c4"/><polygon points="0,-84 0,-74 14,-79" fill="#d9594c"/></g></g>` +
      `<path d="M52 66 q6 -8 12 0 q6 -8 12 0 M232 104 q5 -7 10 0 q5 -7 10 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    /* 3 dusk + paper lanterns */ id =>
      sky(id, [[0, "#232663"], [.55, "#8a5fa8"], [1, "#f7b38a"]]) + stars(31, 34, 190) +
      hill("M0 300 Q90 262 180 288 T300 276 V400 H0Z", "#2e2d5f") + house(70, 322, 1, "#38366f", "#25244f", "#ffd27a") + house(214, 316, .85, "#38366f", "#25244f", "#ffd27a") +
      hill("M0 352 Q110 326 210 348 T300 340 V400 H0Z", "#1f1f48") +
      lantern(70, 120, 1.1, 0) + lantern(150, 70, .8, -1.2) + lantern(220, 150, 1.25, -2) + lantern(120, 214, .9, -.6) + lantern(36, 232, .65, -3) + lantern(262, 52, .6, -1.8) + lantern(184, 252, .7, -2.6),
    /* 4 windmill */ id =>
      sky(id, [[0, "#8ccff2"], [1, "#fff0cf"]]) + cloud(76, 90, 1.2) + cloud(240, 130, .9, { slow: 1 }) +
      hill("M0 276 Q90 232 190 262 T300 250 V400 H0Z", "#9ad37a") +
      `<g transform="translate(168 262)"><polygon points="-20,0 20,0 13,-78 -13,-78" fill="#f6e7c8"/><polygon points="-17,-78 0,-102 17,-78" fill="#c85a4a"/><rect x="-5" y="-22" width="10" height="22" rx="5" fill="#8a5a3c"/><rect x="-4" y="-56" width="8" height="10" rx="2" fill="#b7d9ef"/><g transform="translate(0 -84)"><g class="g-spin"><rect x="-3" y="-58" width="6" height="116" fill="#b98a5a"/><rect x="-58" y="-3" width="116" height="6" fill="#b98a5a"/><rect x="3" y="-56" width="15" height="34" fill="#fff" opacity=".92"/><rect x="-18" y="22" width="15" height="34" fill="#fff" opacity=".92"/><rect x="22" y="3" width="34" height="15" fill="#fff" opacity=".92"/><rect x="-56" y="-18" width="34" height="15" fill="#fff" opacity=".92"/></g><circle r="6" fill="#7a5238"/></g></g>` +
      hill("M0 326 Q110 290 210 318 T300 308 V400 H0Z", "#6fc062") + hill("M0 362 Q120 336 220 358 T300 350 V400 H0Z", "#4ea85a") + dots(41, 30, 6, 294, 330, 396, ["#ffe27a", "#fff", "#ffb3cf"]),
    /* 5 hot-air balloon */ id =>
      sky(id, [[0, "#78c2ec"], [1, "#f9e6c9"]]) + cloud(70, 250, 1, { slow: 1 }) + cloud(250, 120, .8) +
      `<polygon points="0,300 74,206 150,300" fill="#a8c1da"/><polygon points="120,300 200,186 290,300" fill="#97b3d0"/><polygon points="200,186 190,204 202,200 210,208" fill="#fff"/>` +
      hill("M0 318 Q90 286 180 308 T300 296 V400 H0Z", "#8fd07a") + hill("M0 360 Q110 332 210 356 T300 346 V400 H0Z", "#62b35e") +
      `<g transform="translate(150 150)"><g class="g-bob"><path d="M0 -58 C54 -58 60 6 24 46 L15 56 H-15 L-24 46 C-60 6 -54 -58 0 -58Z" fill="#e96b6b"/><path d="M0 -58 C22 -58 26 6 11 56 H-11 C-26 6 -22 -58 0 -58Z" fill="#ffd36b"/><path d="M-15 56 L-11 74 M15 56 L11 74" stroke="#7a5238" stroke-width="2"/><rect x="-13" y="74" width="26" height="15" rx="3" fill="#a9703f"/></g></g>`,
    /* 6 lighthouse sunset */ id =>
      sky(id, [[0, "#f6a398"], [.55, "#fcd6a4"], [1, "#fff0cf"]]) + cloud(70, 90, 1.2, { fill: "#ffe3d6", shade: "#f0a595" }) + cloud(228, 150, .8, { fill: "#ffe3d6", shade: "#f0a595", slow: 1 }) +
      `<circle cx="104" cy="236" r="74" fill="#fff2b8" opacity=".3"/><circle cx="104" cy="238" r="42" fill="#ffe7a3"/>` +
      `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b48c"/><stop offset=".3" stop-color="#6aa6c4"/><stop offset="1" stop-color="#2e6f99"/></linearGradient></defs><rect y="250" width="300" height="150" fill="url(#${id}s)"/>` +
      `<ellipse cx="104" cy="262" rx="42" ry="3.5" fill="#ffe7a3" opacity=".75"/><ellipse cx="104" cy="276" rx="30" ry="3" fill="#ffe7a3" opacity=".55"/><ellipse cx="104" cy="292" rx="18" ry="2.5" fill="#ffe7a3" opacity=".4"/>` +
      `<polygon points="248,176 0,138 0,214" fill="#fff3b0" opacity=".3"/><path d="M180 400 V306 Q190 274 236 272 Q284 270 300 284 V400Z" fill="#4c6050"/><path d="M190 300 Q200 276 238 274 Q280 272 300 286 V292 Q270 282 236 284 Q204 286 190 306Z" fill="#6f8c6a"/>` +
      `<g transform="translate(248 274)"><polygon points="-12,0 12,0 8,-86 -8,-86" fill="#fff"/><polygon points="-10.6,-30 10.6,-30 9.9,-46 -9.9,-46" fill="#d9594c"/><polygon points="-9.1,-62 9.1,-62 8.4,-78 -8.4,-78" fill="#d9594c"/><rect x="-12" y="-92" width="24" height="6" fill="#4a3556"/><rect x="-8" y="-104" width="16" height="12" fill="#ffe27a"/><polygon points="-12,-104 0,-118 12,-104" fill="#d9594c"/></g>`,
    /* 7 forest + light rays */ id =>
      sky(id, [[0, "#c9ecb8"], [1, "#eef8cf"]]) + `<g fill="#8cc79a">${dots(71, 14, 0, 300, 150, 300, ["#8cc79a", "#7dbd90"], 22, 38)}</g>` +
      `<polygon points="30,0 76,0 200,400 110,400" fill="#fff" opacity=".2"/><polygon points="110,0 142,0 270,400 210,400" fill="#fff" opacity=".16"/>` +
      `<rect x="26" y="0" width="40" height="400" fill="#6b4a35"/><rect x="36" y="0" width="8" height="400" fill="#8a6446" opacity=".6"/><rect x="214" y="0" width="30" height="400" fill="#6b4a35"/><rect x="222" y="0" width="6" height="400" fill="#8a6446" opacity=".6"/>` +
      `<circle cx="10" cy="14" r="88" fill="#3f9a52"/><circle cx="130" cy="-6" r="82" fill="#4aa85c"/><circle cx="266" cy="12" r="92" fill="#3f9a52"/><circle cx="60" cy="56" r="44" fill="#58b564" opacity=".8"/><circle cx="196" cy="48" r="40" fill="#58b564" opacity=".8"/>` +
      hill("M0 332 Q100 302 200 326 T300 316 V400 H0Z", "#5aae5c") + hill("M0 372 Q120 350 220 370 T300 362 V400 H0Z", "#4a9c52") +
      `<g transform="translate(110 350)"><rect x="-3" y="-6" width="6" height="12" fill="#fff0d6"/><path d="M-14 -4 Q0 -26 14 -4Z" fill="#e5604f"/><circle cx="-5" cy="-11" r="2" fill="#fff"/><circle cx="5" cy="-9" r="1.6" fill="#fff"/></g><g transform="translate(176 372) scale(.7)"><rect x="-3" y="-6" width="6" height="12" fill="#fff0d6"/><path d="M-14 -4 Q0 -26 14 -4Z" fill="#e5604f"/><circle cx="-5" cy="-11" r="2" fill="#fff"/></g>` +
      `<g class="g-twinkle">${dots(72, 9, 20, 280, 180, 330, ["#fff6a8"], 1.6, 2.6)}</g>`,
    /* 8 starry night + glowing window */ id =>
      sky(id, [[0, "#0f1b4d"], [1, "#4b58a8"]]) + stars(81, 46, 250) +
      `<circle cx="222" cy="92" r="58" fill="#ffe9a8" opacity=".14"/><circle cx="222" cy="92" r="44" fill="#ffe9a8" opacity=".18"/><path d="M222 58 A34 34 0 0 0 222 126 A21 34 0 0 1 222 58Z" fill="#ffe9a8"/>` +
      hill("M0 300 Q90 262 190 290 T300 278 V400 H0Z", "#1d2a5c") +
      `<circle cx="96" cy="296" r="38" fill="#ffd27a" opacity=".16"/>` + house(96, 306, 1.5, "#2c3270", "#1b1f4f", "#ffd27a") + smoke(120, 232) +
      `<g transform="translate(236 306)"><rect x="-3" y="-10" width="6" height="36" fill="#161c45"/><circle cy="-26" r="22" fill="#161c45"/><circle cx="-14" cy="-14" r="14" fill="#161c45"/><circle cx="14" cy="-14" r="15" fill="#161c45"/></g>` +
      hill("M0 350 Q120 322 220 346 T300 338 V400 H0Z", "#162250") + `<g class="g-twinkle">${dots(82, 7, 20, 280, 330, 390, ["#ffe9a8"], 1.4, 2.2)}</g>`,
    /* 9 sunflowers + big sun */ id =>
      sky(id, [[0, "#7fd2f4"], [1, "#fff4c9"]]) + `<circle cx="232" cy="84" r="70" fill="#fff2a8" opacity=".25"/><circle cx="232" cy="84" r="50" fill="#ffee94" opacity=".4"/><circle cx="232" cy="84" r="32" fill="#ffe27a"/>` +
      cloud(72, 112, 1.2) + cloud(210, 188, .8, { slow: 1 }) + hill("M0 282 Q90 246 190 272 T300 262 V400 H0Z", "#9ad37a") + hill("M0 322 Q110 290 210 314 T300 304 V400 H0Z", "#74c466") +
      sunflower(60, 290, .55) + sunflower(130, 280, .5) + sunflower(224, 286, .6) + hill("M0 366 Q120 342 220 362 T300 354 V400 H0Z", "#52ad5b") +
      sunflower(40, 312, 1.1) + sunflower(150, 322, 1.35) + sunflower(258, 310, 1) +
      `<g transform="translate(96 214)"><g class="g-flutter"><ellipse cx="-6" cy="0" rx="7" ry="5" fill="#ffb3cf"/><ellipse cx="6" cy="0" rx="7" ry="5" fill="#ffb3cf"/></g></g><g transform="translate(206 246) scale(.8)"><g class="g-flutter"><ellipse cx="-6" cy="0" rx="7" ry="5" fill="#dccbf7"/><ellipse cx="6" cy="0" rx="7" ry="5" fill="#dccbf7"/></g></g>`,
    /* 10 video card: drifting clouds + play button */ id =>
      sky(id, [[0, "#4f9fc4"], [.6, "#f3c7a2"], [1, "#fde9c8"]]) + `<circle cx="150" cy="272" r="62" fill="#fff2b8" opacity=".3"/><circle cx="150" cy="276" r="40" fill="#ffe0a0"/>` +
      cloud(70, 96, 1.3) + cloud(240, 170, 1, { slow: 1 }) + cloud(120, 330, .8) +
      hill("M0 292 Q90 262 190 284 T300 272 V400 H0Z", "#6fb87a") + hill("M0 338 Q120 312 220 334 T300 326 V400 H0Z", "#4a9c62") +
      `<circle cx="150" cy="190" r="36" fill="#fff" opacity=".9"/><polygon points="140,172 140,208 170,190" fill="#d9594c"/>`
  ];

  const art = i => {
    const id = "gh" + i;
    return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${scenes[i % scenes.length](id)}</svg>`;
  };
  return { art, cloud };
})();

/* Tries the saved path first, then the same file name with the other common photo extensions
   (.jpg / .jpeg / .png / .webp), so photo3.jpeg still loads when the slot says photo3.jpg. */
function imageCandidates(path) {
  const m = /^(.*)\.(jpe?g|png|webp)$/i.exec(path);
  if (!m || /^https?:/i.test(path)) return [path];
  const base = m[1];
  return [...new Set([path, ...["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"].map(x => `${base}.${x}`)])];
}
function loadImage(path) {                       // resolves with the first URL that really loads, else null
  const list = imageCandidates(path);
  return new Promise(resolve => {
    const next = i => {
      if (i >= list.length) { resolve(null); return; }
      const probe = new Image();
      probe.onload = () => resolve(list[i]);
      probe.onerror = () => next(i + 1);
      probe.src = list[i];
    };
    next(0);
  });
}

const rail = $("#rail"), pdots = $("#pdots");
let cardEls = [], active = 0;

function buildGallery() {
  rail.replaceChildren();
  pdots.replaceChildren();
  cardEls = [];

  CFG.captions.forEach((cap, i) => {
    const isVideo = i >= MEDIA.photoCount;
    const n = i + 1;
    const card = el("figure", { class: "pcard" + (isVideo ? " vcard" : "") });
    const photo = el("div", { class: "photo" });
    const ph = el("div", { class: "ph art" });
    ph.innerHTML = Ghibli.art(i) + `<span class="ph-label">${isVideo ? "Video #1" : "Memory #" + n}</span>`;
    photo.append(ph);

    if (isVideo) {
      const v = el("video", { controls: true, playsInline: true, preload: "metadata" });
      v.setAttribute("playsinline", "");
      v.addEventListener("loadedmetadata", () => { v.classList.add("ok"); ph.hidden = true; });
      v.addEventListener("error", () => { v.remove(); });
      v.addEventListener("play", () => { if (Music.on && !v.muted) Music.stop(); });   // video sound beats background music
      v.src = CFG.media.video + "#t=0.1";                      // #t=0.1 makes phones show a first-frame preview
      photo.append(v);
    } else {
      const img = el("img", { alt: `Memory ${n}`, decoding: "async" });
      img.addEventListener("load", () => { img.classList.add("ok"); ph.hidden = true; });
      photo.append(img);
      loadImage(CFG.media.photos[i]).then(url => { if (url) img.src = url; else img.remove(); });
    }

    card.append(photo, el("figcaption", { class: "cap", text: cap }));
    card.addEventListener("click", () => scrollToIndex(cardEls.indexOf(card)));   // click a card -> centre it
    rail.appendChild(card);
    cardEls.push(card);
    pdots.appendChild(document.createElement("i"));
  });
  setActive(Math.min(active, cardEls.length - 1));
}

function pauseVideos() { $$("video", rail).forEach(v => { try { v.pause(); } catch (e) {} }); }

function setActive(i) {
  const prev = active;
  active = Math.max(0, Math.min(cardEls.length - 1, i));
  cardEls.forEach((c, j) => c.classList.toggle("on", j === active));
  $$("i", pdots).forEach((d, j) => d.classList.toggle("on", j === active));
  if (prev !== active) pauseVideos();
}
/* Exact centred scroll position for a card (rail is position:relative, so offsetLeft is measured from the rail). */
const cardCenterLeft = card => card.offsetLeft - (rail.clientWidth / 2) + (card.clientWidth / 2);

let railBusy = false, railTimer = 0;
function endRailMove() {                          // programmatic slide finished: lock onto the exact centre, re-enable snapping
  clearTimeout(railTimer);
  railBusy = false;
  const c = cardEls[active];
  if (c) rail.scrollLeft = cardCenterLeft(c);
  rail.classList.remove("moving");
}
function scrollToIndex(index, instant = false) {
  if (!cardEls.length) return;
  index = Math.max(0, Math.min(cardEls.length - 1, index));
  setActive(index);                               // dots/highlight update at once, so rapid taps always step by exactly 1
  railBusy = true;
  rail.classList.add("moving");                   // snapping off while we animate, so it can't fight the scroll
  const left = cardCenterLeft(cardEls[index]);
  if (instant || REDUCED) { rail.scrollLeft = left; requestAnimationFrame(endRailMove); return; }
  rail.scrollTo({ left, behavior: "smooth" });
  clearTimeout(railTimer);
  railTimer = setTimeout(endRailMove, 320);       // re-armed by every scroll event below
}
function syncRail() {                             // entering the gallery: Photo 1 dead centre
  scrollToIndex(0, true);
  setTimeout(() => { if (current === 2 && active === 0) scrollToIndex(0, true); }, 560);   // again once the slide-in finishes
}
function nearestCard() {
  const mid = rail.scrollLeft + rail.clientWidth / 2;
  let best = 0, bestD = Infinity;
  cardEls.forEach((c, i) => {
    const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
let railTick = 0;
rail.addEventListener("scroll", () => {
  if (railBusy) { clearTimeout(railTimer); railTimer = setTimeout(endRailMove, 140); return; }   // our own slide: don't re-pick the card
  if (railTick) return;
  railTick = requestAnimationFrame(() => { railTick = 0; setActive(nearestCard()); });           // finger swipe
}, { passive: true });
["touchstart", "pointerdown", "wheel"].forEach(ev =>
  rail.addEventListener(ev, () => { if (railBusy) endRailMove(); }, { passive: true }));          // the user took over
window.addEventListener("resize", () => { if (current === 2) scrollToIndex(active, true); });

$("#prev").addEventListener("click", () => scrollToIndex(active - 1));    // strictly one step back
$("#next").addEventListener("click", () => scrollToIndex(active + 1));    // strictly one step forward
rail.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") { e.preventDefault(); scrollToIndex(active + 1); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); scrollToIndex(active - 1); }
});
$("#to4").addEventListener("click", () => go(3));
buildGallery();

/* ---------------------------------------------------------------------
   Screen 4 — quiz (4 questions), then the Tamil letter
   --------------------------------------------------------------------- */
let qi = 0, qBusy = false;

function startQuiz() {
  qi = 0; qBusy = false;
  const dots = $("#qdots");
  dots.replaceChildren(...CFG.quiz.map(() => document.createElement("i")));
  $("#quiz").hidden = false;
  $("#letterWrap").hidden = true;
  showQuestion();
}

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showQuestion() {
  const q = CFG.quiz[qi];
  $("#qcount").textContent = `Question ${qi + 1} of ${CFG.quiz.length}`;
  $("#qtext").textContent = q.q;
  $$("#qdots i").forEach((d, i) => {
    d.classList.toggle("done", i < qi);
    d.classList.toggle("now", i === qi);
  });
  const box = $("#opts");
  box.replaceChildren();
  shuffled(q.a.length).forEach(j => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = q.a[j];
    b.addEventListener("click", () => answer(b, j));
    box.appendChild(b);
  });
}

function answer(btn, j) {
  if (qBusy) return;
  const q = CFG.quiz[qi];
  if (j === q.right) {
    qBusy = true;
    btn.classList.add("right");
    $$("#opts button").forEach(b => (b.disabled = true));
    toast(q.good);
    confettiPop(70);
    setTimeout(() => {
      qi++;
      qBusy = false;
      if (qi < CFG.quiz.length) showQuestion(); else showLetter();
    }, 1300);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    toast(q.bad);
    if (navigator.vibrate) navigator.vibrate(60);
  }
}

function showLetter() {
  $$("#qdots i").forEach(d => { d.classList.add("done"); d.classList.remove("now"); });
  $("#quiz").hidden = true;
  const body = $("#letterBody");
  body.replaceChildren();
  CFG.letter.forEach((line, i) => {
    const p = document.createElement("p");
    p.textContent = line;
    p.style.setProperty("--i", i);
    if (i === 0) p.className = "salute";
    if (i === CFG.letter.length - 1) p.className = "sign";
    body.appendChild(p);
  });
  $("#letterWrap").hidden = false;
  window.scrollTo(0, 0);
  burst(50, .5, .15, { stars: .9, speed: 5, gravity: .12 });
}
$("#to5").addEventListener("click", () => go(4));

/* ---------------------------------------------------------------------
   Screen 5 — night-space finale
   cake -> candles out -> Ghibli rocket flies to the full moon -> surprise card + confetti + music
   --------------------------------------------------------------------- */

/* Deep-space canvas: twinkling stars, drifting glow dust and the odd shooting star. */
const Space = (() => {
  const cv = $("#space"), c = cv.getContext("2d");
  const TINTS = ["255,255,255", "255,241,201", "207,224,255", "255,217,236"];
  const DUST = ["183,155,236", "143,214,200", "233,139,180", "242,184,75"];
  let w = 0, h = 0, stars = [], dust = [], sprites = [], shoot = null, nextShoot = 0, raf = 0, running = false;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function sprite(rgb) {                                   // one soft glow, pre-rendered, reused for every dust mote
    const s = document.createElement("canvas");
    s.width = s.height = 96;
    const g = s.getContext("2d"), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.4, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
    return s;
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(240, Math.max(90, w * h / 4800)));
    stars = Array.from({ length: n }, () => {
      const big = Math.random() < .08;
      return { x: rnd(0, w), y: rnd(0, h), r: big ? rnd(1.5, 2.3) : rnd(.35, 1.3), sp: rnd(.6, 2.6), ph: rnd(0, 6.28),
               t: TINTS[(Math.random() * TINTS.length) | 0], big };
    });
    dust = Array.from({ length: 34 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(16, 52), vx: rnd(-.12, .12), vy: rnd(-.14, -.03),
                                                a: rnd(.05, .16), ph: rnd(0, 6.28), s: (Math.random() * DUST.length) | 0 }));
  }
  function draw(t) {
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0b0d1b"); bg.addColorStop(.7, "#10132c"); bg.addColorStop(1, "#1b1a3f");
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    for (const d of dust) {
      if (!REDUCED) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -d.r) { d.y = h + d.r; d.x = rnd(0, w); }
        if (d.x < -d.r) d.x = w + d.r; else if (d.x > w + d.r) d.x = -d.r;
      }
      c.globalAlpha = d.a * (.7 + .3 * Math.sin(t * .6 + d.ph));
      c.drawImage(sprites[d.s], d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
    }
    for (const s of stars) {
      const a = REDUCED ? .8 : .45 + .55 * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      c.globalAlpha = a; c.fillStyle = `rgb(${s.t})`;
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.2832); c.fill();
      if (s.big) {                                        // 4-point twinkle on the brightest stars
        const L = s.r * 4.5 * a;
        c.globalAlpha = a * .6; c.strokeStyle = `rgb(${s.t})`; c.lineWidth = .8;
        c.beginPath(); c.moveTo(s.x - L, s.y); c.lineTo(s.x + L, s.y); c.moveTo(s.x, s.y - L); c.lineTo(s.x, s.y + L); c.stroke();
      }
    }
    c.globalAlpha = 1;

    if (!REDUCED) {
      if (!shoot && t > nextShoot) {
        shoot = { x: rnd(w * .3, w), y: rnd(0, h * .35), vx: -rnd(5, 8), vy: rnd(2.2, 3.6), life: 1 };
        nextShoot = t + rnd(6, 11);
      }
      if (shoot) {
        const tx = shoot.x - shoot.vx * 9, ty = shoot.y - shoot.vy * 9;
        const g = c.createLinearGradient(shoot.x, shoot.y, tx, ty);
        g.addColorStop(0, `rgba(255,250,220,${shoot.life})`); g.addColorStop(1, "rgba(255,250,220,0)");
        c.strokeStyle = g; c.lineWidth = 1.6; c.lineCap = "round";
        c.beginPath(); c.moveTo(shoot.x, shoot.y); c.lineTo(tx, ty); c.stroke();
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= .012;
        if (shoot.life <= 0) shoot = null;
      }
    }
  }
  function frame(ms) {
    if (!running) return;
    draw(ms / 1000);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    if (!sprites.length) sprites = DUST.map(sprite);
    size();
    running = true;
    if (REDUCED) { draw(0); return; }                    // calm, static sky for reduced-motion users
    nextShoot = performance.now() / 1000 + 2.5;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function resize() { if (!running) return; size(); if (REDUCED) draw(0); }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (running && !REDUCED) raf = requestAnimationFrame(frame);
  });
  return { start, stop, resize };
})();
window.addEventListener("resize", () => Space.resize());

function setSpace(on) {
  document.body.classList.toggle("space", on);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = on ? "#0b0d1b" : "#f9d3e3";
  if (on) Space.start(); else Space.stop();
}

/* The rocket is hand-drawn SVG (cream body, red nose, round window, warm flame), nose pointing up. */
const ROCKET_INNER =
  '<g class="rk-flame"><path d="M23 94 Q21 110 30 122 Q39 110 37 94Z" fill="#ff9d3a"/><path d="M26 94 Q26 105 30 113 Q34 105 34 94Z" fill="#ffe27a"/></g>' +
  '<path d="M14 66 C3 73 1 88 3 101 L16 90Z" fill="#d9594c" stroke="#5a3a2a" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M46 66 C57 73 59 88 57 101 L44 90Z" fill="#d9594c" stroke="#5a3a2a" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M20 88 H40 L37 97 H23Z" fill="#8a5a3c" stroke="#5a3a2a" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M30 5 C45 19 48 46 46 90 H14 C12 46 15 19 30 5Z" fill="#fdf0d5" stroke="#5a3a2a" stroke-width="2.4" stroke-linejoin="round"/>' +
  '<path d="M30 5 C38 12 42 20 44 31 H16 C18 20 22 12 30 5Z" fill="#d9594c" stroke="#5a3a2a" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M13.6 76 H46.4 V82 H13.6Z" fill="#3d8f9e" stroke="#5a3a2a" stroke-width="1.6"/>' +
  '<circle cx="30" cy="55" r="9.5" fill="#bfe6f5" stroke="#c9a24a" stroke-width="3"/>' +
  '<path d="M25 51 Q27 47 31 47" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
  '<circle cx="19" cy="42" r="1.4" fill="#5a3a2a"/><circle cx="41" cy="42" r="1.4" fill="#5a3a2a"/><circle cx="18" cy="68" r="1.4" fill="#5a3a2a"/><circle cx="42" cy="68" r="1.4" fill="#5a3a2a"/>';

/* Header painting for the surprise card: dusk sky, big moon, hills and a tiny rocket on its way. */
const WISH_ART =
  '<defs><linearGradient id="wa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27327f"/><stop offset=".62" stop-color="#6d68b8"/><stop offset="1" stop-color="#f4b6a2"/></linearGradient></defs>' +
  '<rect width="400" height="190" fill="url(#wa-sky)"/>' +
  '<g class="g-twinkle" fill="#fff"><circle cx="30" cy="24" r="1.6"/><circle cx="74" cy="52" r="1.2"/><circle cx="118" cy="20" r="1.8"/><circle cx="168" cy="44" r="1.2"/><circle cx="214" cy="18" r="1.5"/><circle cx="52" cy="92" r="1.1"/><circle cx="352" cy="30" r="1.6"/><circle cx="384" cy="96" r="1.2"/><circle cx="148" cy="86" r="1.1"/></g>' +
  '<circle cx="302" cy="74" r="62" fill="#fff6cf" opacity=".14"/><circle cx="302" cy="74" r="48" fill="#fff6cf" opacity=".22"/><circle cx="302" cy="74" r="34" fill="#fff6cf"/>' +
  '<circle cx="291" cy="65" r="6" fill="#e6d79c" opacity=".7"/><circle cx="314" cy="86" r="8" fill="#e6d79c" opacity=".6"/><circle cx="312" cy="58" r="3.5" fill="#e6d79c" opacity=".7"/>' +
  Ghibli.cloud(78, 146, .8, { fill: "#d8caf5", shade: "#a799d8" }) + Ghibli.cloud(344, 150, .6, { fill: "#d8caf5", shade: "#a799d8", slow: 1 }) +
  '<path d="M0 160 Q100 126 210 152 T400 140 V190 H0Z" fill="#3d6f8a"/><path d="M0 178 Q120 150 240 172 T400 166 V190 H0Z" fill="#2b5470"/>' +
  '<circle cx="164" cy="128" r="4" fill="#fff" opacity=".55"/><circle cx="148" cy="135" r="5.5" fill="#fff" opacity=".4"/><circle cx="130" cy="142" r="7" fill="#fff" opacity=".28"/>' +
  `<g transform="translate(196 112) rotate(66) scale(.5) translate(-30 -60)">${ROCKET_INNER}</g>`;

/* The rocket flight: lifts off from the cake, swerves up through the sky, lands on the moon. */
const Rocket = (() => {
  const box = $("#rocket"), moon = $("#moon");
  let raf = 0, token = 0;
  box.innerHTML = `<svg viewBox="0 0 60 120" aria-hidden="true">${ROCKET_INNER}</svg>`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const place = (x, y, ang, sc, op) => {
    box.style.transform = `translate(${x - 23}px, ${y - 46}px) rotate(${ang}deg) scale(${sc})`;
    box.style.opacity = op;
  };
  function exhaust(x, y, ang, sc, now, state, gap) {       // smoke + sparks from the nozzle
    if (now - state.t < gap) return;
    state.t = now;
    const a = ang * Math.PI / 180;
    const tx = x - Math.sin(a) * 46 * sc, ty = y + Math.cos(a) * 46 * sc;
    puff(tx, ty, 6 * sc + 3);
    if (Math.random() < .6) spark(tx, ty);
  }
  function hitMoon(E) {
    moon.classList.remove("hit"); void moon.offsetWidth; moon.classList.add("hit");
    burst(REDUCED ? 30 : 80, E.x / W, E.y / H, { stars: .9, speed: 6, gravity: .04 });
  }
  function cancel() {
    token++;
    cancelAnimationFrame(raf);
    box.hidden = true;
    document.body.classList.remove("flying");
    moon.classList.remove("hit");
  }
  function launch(done) {
    cancel();
    const my = ++token;
    const mr = () => { const r = moon.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

    if (REDUCED) {                                          // no flight for reduced-motion users: the wish just arrives
      hitMoon(mr());
      setTimeout(() => { if (my === token) done(); }, 700);
      return;
    }

    document.body.classList.add("flying");
    const c0 = $("#candles").getBoundingClientRect();
    const sx = c0.left + c0.width / 2, sy = c0.top - 6;     // rocket stands on top of the cake
    const side = Math.random() < .5 ? -1 : 1;
    const PRE = 900, DUR = 3400, T0 = performance.now();
    const smoke = { t: 0 };
    box.hidden = false;
    place(sx, sy, 0, .5, 0);

    function frame(now) {
      if (my !== token) return;
      const el = Math.max(0, now - T0);

      if (el < PRE) {                                       // ignition: rumble + smoke, then lift-off
        const k = el / PRE;
        place(sx + (Math.random() - .5) * 3 * k, sy + (Math.random() - .5) * 2 * k, 0, lerp(.5, 1, Math.min(1, k * 2)), Math.min(1, k * 3));
        exhaust(sx, sy, 0, 1, now, smoke, 70 - 40 * k);
        raf = requestAnimationFrame(frame);
        return;
      }

      const u = Math.min(1, (el - PRE) / DUR), e = u * u * (3 - 2 * u);
      const E = mr();
      const dy = E.y - sy;
      const P = [
        { x: sx, y: sy },
        { x: Math.max(28, Math.min(W - 28, sx + side * W * .34)), y: sy + dy * .38 },
        { x: Math.max(28, Math.min(W - 28, E.x - side * W * .3)), y: sy + dy * .72 },
        E
      ];
      const m = 1 - e;
      const bx = m * m * m * P[0].x + 3 * m * m * e * P[1].x + 3 * m * e * e * P[2].x + e * e * e * P[3].x;
      const by = m * m * m * P[0].y + 3 * m * m * e * P[1].y + 3 * m * e * e * P[2].y + e * e * e * P[3].y;
      const tx = 3 * m * m * (P[1].x - P[0].x) + 6 * m * e * (P[2].x - P[1].x) + 3 * e * e * (P[3].x - P[2].x);
      const ty = 3 * m * m * (P[1].y - P[0].y) + 6 * m * e * (P[2].y - P[1].y) + 3 * e * e * (P[3].y - P[2].y);
      const tilt = Math.atan2(tx, -ty) * 180 / Math.PI;
      const wob = Math.sin(u * 16) * (1 - u);
      const ang = lerp(0, tilt, Math.min(1, u * 6)) + wob * 5;
      const x = bx + wob * 5, y = by;
      const sc = lerp(1, .42, e);

      place(x, y, ang, sc, u > .9 ? Math.max(0, (1 - u) / .1) : 1);
      exhaust(x, y, ang, sc, now, smoke, 38);

      if (u >= 1) {                                         // touchdown on the moon
        box.hidden = true;
        document.body.classList.remove("flying");
        hitMoon(E);
        setTimeout(() => { if (my === token) done(); }, 900);
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  return { launch, cancel };
})();

const candles = $$(".candle");
let blown = 0;
$("#wishArt").innerHTML = WISH_ART;

function resetCake() {
  Rocket.cancel();
  showModal("wishModal", false);
  blown = 0;
  candles.forEach(c => c.classList.remove("out"));
  $("#cake").classList.add("lit");
  $("#cakeHead").textContent = "Tap the candles to blow them out! 🎂";
  $("#cakeHead").hidden = false;
  $("#banner").hidden = true;
  $("#afterRow").hidden = true;
  $("#candleNote").hidden = false;
  $("#candleNote").textContent = "Ovvoru candle-um oru wish ✨ — tap each one";
}

function blow(c) {
  if (c.classList.contains("out")) return;
  c.classList.add("out");
  blown++;
  const left = candles.length - blown;
  if (navigator.vibrate) navigator.vibrate(25);
  if (left > 0) {
    $("#candleNote").textContent = `${left} more! Wish pannu 🤞`;
  } else {
    $("#candleNote").textContent = "Wish granted! 💫";
    Music.start(true);                                  // starts silently inside this tap (browser rule); fades in on the card
    later(celebrate, 600);
  }
}

function celebrate() {
  $("#cake").classList.remove("lit");
  $("#cakeHead").textContent = "3… 2… 1… liftoff! 🚀";
  $("#candleNote").textContent = "Your wish is flying to the moon 🌕";
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
  Rocket.launch(openWish);
}

function openWish() {
  const box = $("#wishText");
  box.replaceChildren();
  CFG.wish.split("\n").map(t => t.trim()).filter(Boolean).forEach(t => box.append(el("p", { text: t })));
  showModal("wishModal", true);
  Music.reveal();
  confettiBlast();
  if (navigator.vibrate) navigator.vibrate([60, 40, 140]);
  setTimeout(() => $("#wishCard").focus(), 80);
}

function closeWish() {
  if ($("#wishModal").hidden) return;
  showModal("wishModal", false);
  $("#cakeHead").hidden = true;
  $("#banner").hidden = false;
  $("#afterRow").hidden = false;
  $("#candleNote").hidden = true;                     // keeps the Replay button on screen
}

candles.forEach(c => c.addEventListener("click", () => blow(c)));
$("#again").addEventListener("click", () => { Music.stop(); resetCake(); });
$("#reopen").addEventListener("click", openWish);
$("#wishClose").addEventListener("click", closeWish);
$("#wishMusic").addEventListener("click", () => Music.toggle());
$("#wishModal").addEventListener("click", e => { if (e.target === e.currentTarget) closeWish(); });

/* =====================================================================
   BROTHER / ADMIN CONTROLLER
   ===================================================================== */
const modalOpen = () => document.body.classList.contains("noscroll");

function showModal(id, on) {
  $("#" + id).hidden = !on;
  document.body.classList.toggle("noscroll", !$("#pinModal").hidden || !$("#admin").hidden || !$("#wishModal").hidden);
}

/* Back to the lock screen, instantly, with everything reset (used after a wrong admin passcode). */
function forceLock() {
  navToken++;                                          // cancels every pending timer created with later()
  unlocked = false;
  Rocket.cancel();
  ["pinModal", "admin", "wishModal"].forEach(id => showModal(id, false));
  Music.stop();
  setSpace(false);
  pauseVideos();
  screens.forEach(sc => sc.classList.remove("active", "leaving", "entering"));
  screens[0].classList.add("active");
  current = 0; moving = false;
  resetEnvelope();
  resetCake();
  entry = ""; locked = false; paintDots();
  $("#hint").textContent = DEFAULTS.hintStart;
  updateMusicPill();
  window.scrollTo(0, 0);
}

/* --- Secret entry: tap the header star 3 times in a row ------------------ */
(function logoGestures() {
  const logo = $("#logo");
  let taps = 0, timer = 0;
  logo.addEventListener("contextmenu", e => e.preventDefault());
  logo.addEventListener("click", () => {
    clearTimeout(timer);
    taps++;
    if (taps >= 3) {                                  // third tap: admin passcode prompt
      taps = 0;
      if (navigator.vibrate) navigator.vibrate(30);
      openPinPrompt();
      return;
    }
    timer = setTimeout(() => { taps = 0; }, 1200);    // taps must follow each other quickly
    const r = logo.getBoundingClientRect();
    burst(14, (r.left + r.width / 2) / window.innerWidth, (r.top + r.height / 2) / window.innerHeight, { stars: .9, speed: 4, gravity: .12 });
  });
})();

/* --- Admin passcode prompt ---------------------------------------------- */
function openPinPrompt() {
  if (modalOpen()) return;
  $("#adminPinInput").value = "";
  $("#adminPinMsg").textContent = "";
  showModal("pinModal", true);
  setTimeout(() => $("#adminPinInput").focus(), 60);
}
function submitAdminPin() {
  const v = $("#adminPinInput").value;
  if (isPin(v) && hashPin(v) === CFG.adminHash) {
    showModal("pinModal", false);
    openAdmin();
  } else {                                            // wrong admin code -> straight back to Priya's passcode screen
    forceLock();
    const card = $("#lockCard");
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    if (navigator.vibrate) navigator.vibrate(80);
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}
$("#pinOk").addEventListener("click", submitAdminPin);
$("#pinCancel").addEventListener("click", () => showModal("pinModal", false));
$("#adminPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submitAdminPin(); if (e.key === "Escape") showModal("pinModal", false); });
$("#adminPinInput").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (e.target.value.length === 4) submitAdminPin();
});

/* --- Controller panel -------------------------------------------------- */
function openAdmin() {
  fillEditors();
  selectTab("pins");
  showModal("admin", true);
  locked = false;
}
$("#adminClose").addEventListener("click", () => showModal("admin", false));
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!$("#admin").hidden) showModal("admin", false);
  else if (!$("#wishModal").hidden) closeWish();
});

function selectTab(name) {
  $$("#tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"));
  $$("#admin .pane").forEach(p => (p.hidden = p.dataset.pane !== name));
  if (name === "media") buildMediaEditor();
  $(".sheet.admin").scrollTop = 0;
}
$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button[data-tab]");
  if (b) selectTab(b.dataset.tab);
});

function fillEditors() {
  $("#newSisterPin").value = "";
  $("#newAdminPin").value = "";
  $("#defaultPinWarn").hidden = CFG.adminHash !== hashPin(DEFAULT_ADMIN_PIN);
  buildQuizEditor();
  $("#letterEdit").value = CFG.letter.join("\n");
  $("#wishEdit").value = CFG.wish;
  buildCapEditor();
}

/* PINs */
["newSisterPin", "newAdminPin"].forEach(id =>
  $("#" + id).addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); }));

$("#savePins").addEventListener("click", () => {
  const sp = $("#newSisterPin").value, ap = $("#newAdminPin").value;
  if (!sp && !ap) { toast("Nothing to change"); return; }
  if ((sp && !isPin(sp)) || (ap && !isPin(ap))) { toast("Passcodes must be exactly 4 digits"); return; }
  const nextSister = sp ? hashPin(sp) : CFG.sisterHash;
  const nextAdmin = ap ? hashPin(ap) : CFG.adminHash;
  if (nextSister === nextAdmin) { toast("The two passcodes must be different"); return; }
  CFG.sisterHash = nextSister;
  CFG.adminHash = nextAdmin;
  if (!saveConfig()) return;                          // saveConfig already explained the failure
  fillEditors();
  toast("Passcodes saved ✅");
});

/* Quiz */
function buildQuizEditor() {
  const box = $("#quizEditor");
  box.replaceChildren();
  CFG.quiz.forEach((q, i) => {
    const set = el("fieldset", { class: "qe", "data-i": i });
    set.append(el("legend", { text: `Question ${i + 1}` }));
    set.append(el("input", { class: "field", type: "text", value: q.q, maxLength: 200, "data-k": "q", ariaLabel: `Question ${i + 1} text` }));
    q.a.forEach((a, j) => {
      set.append(el("input", { class: "field", type: "text", value: a, maxLength: 80, "data-k": "a" + j, ariaLabel: `Question ${i + 1} option ${j + 1}` }));
    });
    const sel = el("select", { class: "field", "data-k": "right", ariaLabel: `Question ${i + 1} correct option` });
    q.a.forEach((_, j) => sel.append(el("option", { value: String(j), text: `Correct answer: option ${j + 1}`, selected: j === q.right })));
    set.append(sel);
    box.append(set);
  });
}
$("#saveQuiz").addEventListener("click", () => {
  const next = [];
  for (const set of $$("#quizEditor .qe")) {
    const i = +set.dataset.i;
    const get = k => $(`[data-k="${k}"]`, set).value.trim();
    const a = [0, 1, 2, 3].map(j => get("a" + j));
    if (!get("q") || a.some(x => !x)) { toast(`Question ${i + 1}: fill the question and all 4 options`); return; }
    next.push({ q: get("q"), a, right: +get("right"), good: CFG.quiz[i].good, bad: CFG.quiz[i].bad });
  }
  CFG.quiz = next;
  saveConfig();
  toast("Quiz saved ✅");
});
$("#resetQuiz").addEventListener("click", () => {
  if (!confirm("Restore the default 4 quiz questions?")) return;
  CFG.quiz = clone(DEFAULTS.quiz); saveConfig(); buildQuizEditor(); toast("Default quiz restored");
});

/* Letter */
function readLetter() { return $("#letterEdit").value.split("\n").map(s => s.trim()).filter(Boolean); }
$("#saveLetter").addEventListener("click", () => {
  const lines = readLetter();
  if (lines.length < 2) { toast("Write at least 2 lines"); return; }
  CFG.letter = lines.map(s => s.slice(0, 1200)).slice(0, 30);
  saveConfig();
  toast("Letter saved ✅");
});
$("#resetLetter").addEventListener("click", () => {
  if (!confirm("Restore the default Tamil letter?")) return;
  CFG.letter = DEFAULTS.letter.slice(); saveConfig(); $("#letterEdit").value = CFG.letter.join("\n"); toast("Default letter restored");
});

/* Finale wish */
$("#saveWish").addEventListener("click", () => {
  const lines = $("#wishEdit").value.split("\n").map(t => t.trim()).filter(Boolean);
  if (!lines.length) { toast("Write at least 1 line"); return; }
  CFG.wish = lines.join("\n").slice(0, 700);
  saveConfig();
  $("#wishEdit").value = CFG.wish;
  toast("Wish saved ✅");
});
$("#resetWish").addEventListener("click", () => {
  if (!confirm("Restore the default moon wish?")) return;
  CFG.wish = DEFAULTS.wish; saveConfig(); $("#wishEdit").value = CFG.wish; toast("Default wish restored");
});

/* Captions */
function buildCapEditor() {
  const box = $("#capEditor");
  box.replaceChildren();
  CFG.captions.forEach((c, i) => {
    const isVideo = i >= MEDIA.photoCount;
    const id = "cap" + i;
    box.append(
      el("label", { class: "lbl", htmlFor: id, text: isVideo ? "Video 1 caption" : `Photo ${i + 1} caption` }),
      el("input", { class: "field", id, type: "text", value: c, maxLength: 160, "data-i": i })
    );
  });
}
$("#saveCaps").addEventListener("click", () => {
  CFG.captions = $$("#capEditor input").map((inp, i) => inp.value.trim() || DEFAULTS.captions[i]);
  saveConfig();
  buildGallery();
  toast("Captions saved ✅");
});
$("#resetCaps").addEventListener("click", () => {
  if (!confirm("Restore the default captions?")) return;
  CFG.captions = DEFAULTS.captions.slice(); saveConfig(); buildCapEditor(); buildGallery(); toast("Default captions restored");
});

const MEDIA_ICON = { img: "🖼", video: "🎬", audio: "🎵" };
function mediaRows() {
  const rows = CFG.media.photos.map((v, i) => ({ key: "p" + i, label: `Photo ${i + 1}`, kind: "img", value: v, def: MEDIA.photo(i + 1) }));
  rows.push({ key: "video", label: "Video 1", kind: "video", value: CFG.media.video, def: MEDIA.video });
  rows.push({ key: "audio", label: "Background music", kind: "audio", value: CFG.media.audio, def: MEDIA.audio });
  return rows;
}
function buildMediaEditor(useDefaults = false) {
  const list = $("#mediaList");
  list.replaceChildren();
  mediaRows().forEach(r => {
    const id = "mp-" + r.key;
    const input = el("input", { class: "field mpath", id, type: "text", value: useDefaults ? r.def : r.value, maxLength: 300, spellcheck: false, "data-key": r.key });
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "off");
    const row = el("div", { class: "mrow", "data-kind": r.kind }, [
      el("div", { class: "mthumb", text: MEDIA_ICON[r.kind] }),
      el("div", { class: "minfo" }, [el("label", { htmlFor: id, text: r.label }), input]),
      el("span", { class: "mstat", text: "…" })
    ]);
    input.addEventListener("change", () => checkRow(row));
    list.append(row);
  });
  checkFiles();
}

/* Admin file checker: really tries to load each file instead of just validating the text.
   Images -> new Image() onload/onerror (also tries .jpg/.jpeg/.png/.webp of the same name).
   Video / audio -> a media element's loadedmetadata / error. ✓ = loads, ✗ = doesn't. */
function probeMedia(kind, url) {
  return new Promise(resolve => {
    if (kind === "img") { loadImage(url).then(resolve); return; }
    const m = document.createElement(kind === "video" ? "video" : "audio");
    let done = false, t = 0;
    const end = ok => { if (done) return; done = true; clearTimeout(t); m.removeAttribute("src"); try { m.load(); } catch (e) {} resolve(ok ? url : null); };
    t = setTimeout(() => end(false), 9000);
    m.preload = "metadata";
    m.onloadedmetadata = () => end(true);
    m.oncanplay = () => end(true);
    m.onerror = () => {                          // fall back to a header check before giving up
      fetch(url, { method: "HEAD", cache: "no-store" })
        .then(r => end(r.ok && !/text\/html/i.test(r.headers.get("content-type") || "")))
        .catch(() => end(false));
    };
    m.src = url;
  });
}
function checkRow(row) {
  const input = $("input", row), status = $(".mstat", row), thumb = $(".mthumb", row), kind = row.dataset.kind;
  const path = cleanPath(input.value, "");
  const stamp = row._stamp = (row._stamp || 0) + 1;     // ignore answers from an older check of the same row
  const say = (txt, tip, cls) => {
    status.textContent = txt; status.title = tip; status.setAttribute("aria-label", tip);
    status.classList.remove("ok", "bad");
    if (cls) status.classList.add(cls);
  };
  thumb.replaceChildren();
  thumb.textContent = MEDIA_ICON[kind];
  if (!path) { say("✗", "Not a valid path", "bad"); return; }
  say("…", "Checking");
  probeMedia(kind, path).then(found => {
    if (stamp !== row._stamp) return;
    if (!found) { say("✗", "File not found or can't be loaded", "bad"); return; }
    say("✓", found === path ? "File loads" : "Found as " + found, "ok");
    if (found !== path) input.value = found;            // e.g. photo1.jpg -> photo1.jpeg; press "Save paths" to keep it
    if (kind === "img") {
      const img = el("img", { alt: "" });
      img.addEventListener("load", () => { thumb.textContent = ""; thumb.append(img); });
      img.src = found;
    }
  });
}
function checkFiles() { $$("#mediaList .mrow").forEach(checkRow); }
$("#recheck").addEventListener("click", checkFiles);
$("#saveMedia").addEventListener("click", () => {
  const next = { photos: [], video: "", audio: "" };
  for (const r of mediaRows()) {
    const raw = $("#mp-" + r.key).value.trim();
    const clean = raw ? cleanPath(raw, "") : r.def;       // empty box = default path
    if (!clean) { toast(`${r.label}: that path isn't valid`, 3200); return; }
    if (r.key === "video" || r.key === "audio") next[r.key] = clean; else next.photos.push(clean);
  }
  CFG.media = next;
  saveConfig();
  Music.reset();                                        // so a new music path is picked up
  buildGallery();
  buildMediaEditor();
  toast("Media paths saved ✅");
});
$("#resetMedia").addEventListener("click", () => {
  if (!confirm("Restore all media paths to the default assets/ file names?")) return;
  CFG.media = sanitize(null).media;
  saveConfig(); Music.reset(); buildGallery(); buildMediaEditor(); toast("Default paths restored");
});

/* Backup / transfer */
function backupCode() { return b64e(JSON.stringify(CFG)); }
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  const ta = $("#importCode");
  ta.value = text; ta.focus(); ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) {}
  return Promise.resolve(ok);
}
function manualCopyFallback(text) {
  const ta = $("#importCode");
  ta.value = text; ta.focus(); ta.select();
  toast("Select-all & copy it from the box below 👇", 3500);
}
$("#copyLink").addEventListener("click", async () => {
  const link = location.origin + location.pathname + "#cfg=" + backupCode();
  (await copyText(link)) ? toast("Update link copied 🔗") : manualCopyFallback(link);
});
$("#copyCode").addEventListener("click", async () => {
  const code = backupCode();
  (await copyText(code)) ? toast("Backup code copied ✅") : manualCopyFallback(code);
});
$("#doImport").addEventListener("click", () => {
  let txt = $("#importCode").value.trim();
  const m = /cfg=([\w-]+)/.exec(txt);
  if (m) txt = m[1];
  try {
    CFG = sanitize(JSON.parse(b64d(txt)));
    saveConfig();
    fillEditors();
    buildGallery();
    $("#importCode").value = "";
    toast("Imported ✅");
  } catch (e) {
    toast("That code didn't work 🤔");
  }
});
$("#resetAll").addEventListener("click", () => {
  if (!confirm("Reset passcodes, quiz, letter, wish, captions and media paths to the defaults?")) return;
  store.del(KEY_CFG); store.del("sister_pin"); store.del("admin_pin");
  LS_SISTER_PIN = LS_ADMIN_PIN = null;
  CFG = sanitize(null);
  Music.reset();
  fillEditors(); buildGallery();
  toast("Everything reset");
});

/* ---------------------------------------------------------------------
   Start-up: the lock screen is ALWAYS the first thing shown — nothing is remembered between opens.
   Then register the service worker.
   --------------------------------------------------------------------- */
updateMusicPill();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(err => console.warn("Service worker not registered:", err));
  });
  let swReloaded = false;                           // a new worker took over: refresh once, but only while still on the lock screen
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (swReloaded || !navigator.serviceWorker.controller) return;
    if (current === 0 && !unlocked && !entry) { swReloaded = true; location.reload(); }
  });
}
