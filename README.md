# Моника — Холистично изцеление

Static website for Monica, holistic healing practitioner in Sofia. Built for GitHub Pages — no framework, no build step.

## Structure

```
monica-healing/
├── index.html          # Main page (hero, services, events, about, blog, gallery, reviews, contact)
├── blog.html           # Blog listing
├── privacy.html        # Privacy policy (BG + EN)
├── cookies.html        # Cookie policy (BG + EN)
├── disclaimer.html     # Disclaimer (BG + EN)
├── 404.html            # Custom 404 page
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── download-fonts.sh   # Run once to populate assets/fonts/ before first deploy
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js     # Language switch, carousel, mobile nav, form validation
│   │   └── cookies.js  # Informational notice (no consent banner required)
│   ├── fonts/          # Self-hosted woff2 files — run download-fonts.sh to populate
│   └── images/
│       ├── favicon.svg
│       └── og-image.svg  # Design source — export to og-image.jpg before deploy
├── .github/workflows/qa.yml
├── DEPLOY.md           # Full deployment instructions
└── CLAUDE.md           # Project context for AI-assisted editing
```

## Languages

Bulgarian (default) and English. Language is toggled client-side via localStorage (`lang` key). An anti-FOUC inline script in `<head>` prevents flash of wrong language on page load.

## Before deploying

See `DEPLOY.md` for the complete checklist. Quick summary:

1. Run `./download-fonts.sh` to self-host fonts (GDPR — avoids Google Fonts CDN IP transmission)
2. Replace all placeholder strings (`ВАШИЯТ-ДОМЕЙН.com`, `FORMSPREE_ID`, `PLACEHOLDER` URLs)
3. Export `assets/images/og-image.svg` → `og-image.jpg` (1200×630 px)
4. Replace portrait/hero placeholders with real photos using `<picture>` + AVIF/WebP/JPG

## CI

GitHub Actions runs on every push to `main`:

- HTML validation (`html-validate`)
- Accessibility scan (`pa11y-ci`)
- Link check (`lychee`)
- Lighthouse CI (performance, accessibility, SEO, best practices)
