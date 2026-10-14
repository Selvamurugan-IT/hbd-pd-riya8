# Project Little Star v2.1 — Ghibli & Space Finale Edition

Plain HTML/CSS/JS PWA. No build step. All paths are relative (`./`), so it runs from any
GitHub Pages sub-path, e.g. `username.github.io/hbd-priya/`.

## Deploy
1. Add `photo1.jpg … photo10.jpg` (Ghibli-style) to `assets/photos/` and optionally `video1.mp4` to `assets/videos/`.
   Missing files show a painted Ghibli-style SVG card instead.
2. Upload everything in this folder to the root of a GitHub repo → Settings → Pages → `main` / root.
3. Open the HTTPS URL on her phone. iOS: Safari → Share → Add to Home Screen. Android: Chrome → Install app.
4. After changing any file, bump `CACHE` in `sw.js` (`priya-birthday-v2.4`) so installed copies refresh.

## Passcodes
| Who | Default | Where it works |
|---|---|---|
| Priya | `0000` | Lock screen — asked on **every** app open (nothing is remembered) |
| Admin | `1234` | Only through the secret star trigger below |

**Secret admin trigger:** tap the ★ in the top-left corner **3 times in a row** (within ~1.2 s between taps).
Enter the admin passcode → Controller opens. A wrong code throws you back to Priya's lock screen.
Change both passcodes right away in Controller → Passcodes.

## Sister journey
Lock → ribbon envelope → memories (10 photos + video) → 4-question quiz → Tamil letter →
**space finale**: blow out the 5 candles → a Ghibli-style rocket lifts off the cake, swerves up through the
night sky to the glowing full moon → the moon flashes and a birthday surprise card bursts open with
confetti while the music fades in.

## Controller tabs
Passcodes · Quiz · Letter · Wish (text on the moon card) · Captions · Media · Backup.
**Media** edits the path of every photo, the video and the music (relative `./assets/...` paths or `https://` links),
saved in `localStorage`, with a found/missing check.

## Notes
- localStorage keys are prefixed `priya-birthday-v2:` and the service-worker cache is `priya-birthday-v2.1`; it only
  deletes caches starting with `priya-birthday-`, so other apps (e.g. ChronoPulse) on the same origin are untouched.
  Edits saved by v1 are carried over automatically on first run.
- Edits are per-browser: Controller → Backup → **Copy update link** and open it on Priya's phone.
- Passcodes are 4 digits, stored hashed, but the defaults are in `script.js`: a playful lock, not real security.
- If you replace a photo with a new file of the *same name*, bump `CACHE` in `sw.js` (photos are cached first).
- Video and audio are streamed by the browser (not cached by the service worker).
- `bg-music.mp3` is a music-box "Happy Birthday"; if missing, the app synthesises the tune.

## v2.1 fixes
- Carousel: one card per step, click-to-centre, exact centring (`offsetLeft - clientWidth/2 + card.clientWidth/2`).
- Photos load whether the file is `.jpg`, `.jpeg`, `.png` or `.webp`.
- Admin checker really loads each file: ✓ green when it loads, ✗ red when it doesn't.
- Passcodes: localStorage `sister_pin` / `admin_pin` are read first (defaults 2008 / 9999 only when they are null).
  The keys are not prefixed, so another app on the same github.io origin that also uses those names would clash.
- Service worker: cache `priya-birthday-v2.1`, page code is network-first so stale scripts are flushed.
