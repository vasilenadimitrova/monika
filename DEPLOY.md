# Deploy Guide

Static site — GitHub Pages, no build step required.

## Pre-deploy checklist

### 1. Self-host fonts (required for GDPR)

Run once before first deploy:

```bash
chmod +x download-fonts.sh
./download-fonts.sh
```

This populates `assets/fonts/` with the woff2 files referenced in `style.css`. Without this step the site will render in fallback fonts.

Commit the generated font files:

```bash
git add assets/fonts/
git commit -m "Add self-hosted font files"
```

### 2. Replace placeholder values

Search the codebase for these strings and replace before going live:

| Placeholder | Replace with |
|---|---|
| `ВАШИЯТ-ДОМЕЙН.com` | Your actual domain (e.g. `monika-healing.com`) |
| `FORMSPREE_ID` | Your Formspree form ID (see below) |
| `PLACEHOLDER` (social/Google URLs) | Real profile handles |
| `+359 XXX XXX XXX` | Real phone number |
| `contact@monika-healing.com` | Real email address |

### 3. Formspree setup

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form, copy the form ID (format: `xyzabcde`)
3. Replace `FORMSPREE_ID` in `index.html` with that ID
4. Send a test submission and confirm delivery

### 4. OG image

`assets/images/og-image.svg` is the design source. Export it as a JPEG or PNG at 1200×630 px and save as `assets/images/og-image.jpg` before deploy. The `og:image` meta tag points to the `.jpg`.

### 5. Real photos

Replace the placeholder blobs in `index.html` with actual `<picture>` elements using AVIF + WebP + JPG sources:

```html
<picture>
  <source srcset="assets/images/hero.avif" type="image/avif">
  <source srcset="assets/images/hero.webp" type="image/webp">
  <img src="assets/images/hero.jpg" alt="Моника" width="600" height="700"
       fetchpriority="high" decoding="async">
</picture>
```

Always include explicit `width` and `height` to prevent CLS.

---

## GitHub Pages setup

1. Push the repo to GitHub
2. Go to Settings → Pages → Source: **Deploy from a branch**, branch: `main`, folder: `/ (root)`
3. Set a custom domain if you have one (adds a `CNAME` file automatically)

---

## Security headers ceiling (O1)

GitHub Pages does not support custom HTTP response headers. The following headers **cannot** be set via Pages and are instead approximated with `<meta>` tags where possible:

| Header | Status |
|---|---|
| `Content-Security-Policy` | `<meta http-equiv>` in every HTML file — `frame-ancestors` directive is ignored |
| `Strict-Transport-Security` | Not settable via meta — HTTPS is enforced by Pages infrastructure |
| `X-Frame-Options` | Not settable via meta |
| `Permissions-Policy` | Not settable via meta |

**Deferred (O2):** Add Cloudflare as a proxy to set proper HTTP headers. This is the recommended upgrade path once the site is live.

---

## Adding GoatCounter analytics (future, cookieless)

GoatCounter is privacy-respecting, cookieless, and GDPR-compliant with no consent banner required.

When ready:

1. Create a free account at [goatcounter.com](https://www.goatcounter.com)
2. Add to every HTML page before `</body>`:

```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

3. Update `cookies.html` to mention GoatCounter in the cookie table (type: Analytics, no cookies used, no consent required)
4. Update `privacy.html` processor list to add GoatCounter

No consent banner changes needed — GoatCounter uses no cookies.

---

## Adding the gallery page

When gallery photos are ready:

1. Create `gallery.html` following the same shell as `blog.html`
2. Uncomment the gallery button in `index.html` (search for `gallery.html добавете по-късно`)
3. Add `gallery.html` to `sitemap.xml`
