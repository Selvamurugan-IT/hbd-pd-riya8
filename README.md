# Project Little Star — installable PWA (GitHub Pages)

This is a static HTML/CSS/JavaScript Progressive Web App. No build step is required.

## Deploy to GitHub Pages (important)

1. Extract this ZIP.
2. Upload **the contents of this folder** (`index.html`, `manifest.json`, `sw.js`, `script.js`, `style.css`, and `assets/`) to the **root of your GitHub repository**. Do not upload the ZIP itself and do not leave these files inside an extra nested folder.
3. In the repository, open **Settings → Pages** and publish the branch/folder that contains `index.html` (usually `main` / `/(root)`).
4. Wait until GitHub Pages says the site is published. Open the exact HTTPS Pages URL, for example `https://USERNAME.github.io/REPOSITORY/`.
5. Verify these URLs load without a 404, replacing the example URL with yours:
   - `.../manifest.json`
   - `.../sw.js`
   - `.../assets/icons/pwa-icon-192.png`

All app paths are relative, so a project site hosted at `/REPOSITORY/` is supported.

## Install

- **Android (Chrome):** open the HTTPS site, wait for it to finish loading, then tap **Install app** if the button appears, or Chrome menu (⋮) → **Install app** / **Add to Home screen**.
- **Windows/macOS/Linux (Chrome or Edge):** open the HTTPS site and use the **Install** icon in the address bar, or browser menu → **Install Project Little Star**. The in-page Install app button appears when the browser offers its install prompt.
- **iPhone/iPad:** open the site in Safari → Share → **Add to Home Screen**. iOS does not show the same automatic install prompt.

## If you see “Browser could not open app”

1. Make sure the site URL ends with the repository name and `/` for a project site (for example `/little-star/`), not a local file path and not the repository's GitHub source-code URL.
2. Open `manifest.json` on the deployed site and confirm it displays JSON rather than a GitHub 404 page.
3. In Chrome, open DevTools → **Application** → **Manifest** and check for errors. Under **Service Workers**, unregister an old worker, then reload the site. On mobile, clear the site's stored data/cache or remove the old home-screen shortcut and install again.
4. Ensure `index.html`, `manifest.json`, `sw.js`, `script.js`, `style.css`, and the `assets` directory are at the published root together.
5. GitHub Pages must be HTTPS; PWA installation does not work from a plain local `file://` URL.

## App details

- Start URL and scope are `./`, which supports GitHub Pages repository subpaths.
- App icons have separate `any` and `maskable` declarations.
- Service-worker cache was bumped to `priya-birthday-v2.4` so previously cached app-shell files are refreshed.
- Browser install prompts are browser-controlled and do not appear in every browser. The manual browser menu / iOS instructions above still apply.

## Passcodes

| Who | Default | Where it works |
|---|---|---|
| Priya | `0000` | Lock screen |
| Admin | `1234` | Secret admin trigger |

Tap the ★ in the top-left corner three times quickly to open the admin flow. Passcodes are a playful lock, not strong security.
