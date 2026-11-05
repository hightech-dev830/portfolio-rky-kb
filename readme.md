# Kevin Burgess — Portfolio Website

Personal portfolio for Kevin Burgess, Senior AI & Full-Stack Software Engineer.
Updated 2026-11-03.

## Files

- `index.html` — page content (profile, interactive pipeline explainer, experience, skills, education, contact)
- `styles.css` — design system, light/dark themes, animations, responsive layout
- `script.js` — theme toggle, agent console demo, pipeline stepper, experience tabs, skill filters, copy-email

No build step and no dependencies (only Google Fonts).

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8000
```

## Deploy

Upload the three files to any static host: GitHub Pages, Netlify, Vercel or Cloudflare Pages.

## Editing content

- Experience: edit the `<article class="exp-panel">` blocks in `index.html`.
- Pipeline explainer text and code: the `stages` array in `script.js`.
- Hero console Q&A: the `conversations` array in `script.js`.
- Rotating hero words: the `words` array in `script.js`.
