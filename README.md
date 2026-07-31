# Ankit Keshari — Portfolio

Live:

| URL | Host | Notes |
|---|---|---|
| **https://ankit-portfolio-4j2.pages.dev** | Cloudflare Pages | **Use this one** — loads on networks that block `vercel.app` (see below) |
| https://ankit-portfolio-six-nu.vercel.app | Vercel | Same site; blocked by some Indian ISP/campus DNS |
| https://ankit-keshari.vercel.app | Vercel alias | Also behind Vercel Deployment Protection until the toggle below is flipped |

Dark, cinematic single-page portfolio. One shared WebGL canvas sits behind the
whole page: a noise-displaced wave grid and floating wireframes that parallax
with the cursor and drift with scroll, plus each photo rendered as a 3D card
that ripples away from the pointer and tilts toward it. Everything degrades to
clean static HTML + images without WebGL or with reduced motion.

## Stack

Next.js (App Router, TS) · Tailwind v4 · React Three Fiber + drei `<View>` ·
Framer Motion · Lenis. Deployed on Vercel free tier.

## 3D architecture (read before touching `components/three/`)

- **One WebGL context for the entire page.** `GlobalCanvas` mounts a single
  fixed `<Canvas>` with `<View.Port/>`; `SceneBackground` and every `PhotoCard`
  render into it as drei `<View>`s tracked to their DOM rects. Per-element
  canvases were tried first and lost their contexts.
- **All three.js code lives in `components/three/impl.tsx`** so it ships as one
  lazy chunk (first load stays ~168 kB; three.js loads after).
- **Never rotate or skew an element that hosts a `<View>`.** The view rect comes
  from `getBoundingClientRect()`, which is axis-aligned — a CSS rotation makes
  the WebGL layer drift out of its frame. Card tilt is therefore applied to the
  mesh in 3D, not in CSS. Translation (parallax) is fine.
- **Photo planes are sized from their own View camera**, not `viewport` (which
  resolves against the root camera and over-sizes the plane). Rounded corners
  are drawn in the fragment shader because CSS `overflow-hidden` cannot clip a
  fixed canvas.
- **The `<Image>` under each card always stays visible** — it is the LCP element
  and the guaranteed floor if a View is off-screen or a context is lost.

## Updating content (no code needed)

All site copy lives in three JSON files — edit, then redeploy:

- [content/site.json](content/site.json) — hero copy, bio, facts, skills, links, nav
- [content/projects.json](content/projects.json) — project cards (`shipped`) + Building Next (`upcoming`)
- [content/experience.json](content/experience.json) — internship entries

Open this folder in Claude Code and say "add project X" — or edit by hand.

## Photos & resume

Source photos live in `images/`. `npm run photos` regenerates everything in
`public/photos/` (hero crop, duotone fallback, particle source, About photos),
plus `public/og.jpg` and copies `Resume_Ankit_March_2026.pdf` from Downloads to
`public/resume.pdf`. Re-run it after swapping photos or updating the resume
(update the `RESUME` path in [scripts/prepare-photos.mjs](scripts/prepare-photos.mjs) if the filename changes).

## Develop & deploy

```bash
npm run dev          # local dev at :3000
npm run build        # production build check

# Cloudflare Pages (the URL that works everywhere) — deploy BOTH after a change:
STATIC_EXPORT=1 npm run build
npx wrangler pages deploy out --project-name=ankit-portfolio --branch=main --commit-dirty=true

# Vercel
npx vercel deploy --prod --yes
npx vercel alias set <new-deployment-url> ankit-keshari.vercel.app   # re-point each time
```

`STATIC_EXPORT=1` switches [next.config.ts](next.config.ts) to `output: "export"`
(+ unoptimized images) so the site becomes plain files in `out/`. Every route is
static already, and the photos are pre-sized webp, so nothing is lost.

### Visual QA scripts (all write into `.shots/`, use installed Chrome)

| Script | What it checks |
|---|---|
| `node scripts/shoot.mjs` | full-page desktop + mobile |
| `node scripts/sections.mjs` | each section scrolled into view — **the only honest check for anything on the fixed WebGL canvas**, since full-page captures can't paint fixed layers off-screen (`SHOT_W` / `SHOT_H` / `SHOT_TAG` env vars set the viewport) |
| `node scripts/hover-test.mjs .shots` | photo card idle vs. pointer-ripple |
| `node scripts/fallback-test.mjs` | the reduced-motion / no-WebGL path |
| `node scripts/probe.mjs` | console errors + canvas/DOM state |

Set `SHOT_URL` to point any of them at the deployed site instead of localhost.

## If the live site won't open on your network

Some Indian ISPs / campus networks DNS-block `*.vercel.app` — the hostname
resolves to a walled garden (`e.walledgarden.nic.in`, a private `10.x` address)
instead of Vercel, so the page never loads even though the deployment is
healthy. Confirm with:

```powershell
Resolve-DnsName ankit-portfolio-six-nu.vercel.app -Type A
```

If the answer chain mentions `restricted.in` / `walledgarden`, it's the network,
not the site. Verified 2026-07-21: the local resolver returned `10.40.124.9`
while `Resolve-DnsName ... -Server 1.1.1.1` returned the real Vercel IPs, and
`curl --resolve` straight to those IPs served the page fine (HTTP 200).

**That is why the Cloudflare Pages mirror exists** — `pages.dev` resolves
normally on the same network. Keep both deployments in sync, and share the
`pages.dev` link. Other options: mobile data, switching DNS to 1.1.1.1, or a
custom domain (which would sidestep this for recruiters on similar networks —
the strongest reason to buy one).

## One pending dashboard toggle

`ankit-keshari.vercel.app` currently sits behind Vercel Deployment Protection
(shows an SSO page to visitors). To make it public: vercel.com → project
**ankit-portfolio** → Settings → Deployment Protection → set **Vercel
Authentication** to *Disabled* → Save. The six-nu project domain is already
public either way.

## Confidentiality rules baked into the content

- EY entry never names the client or the deliverable (NDA).
- attendAi appears only as an unnamed "stealth project" teaser.
- No invented metrics anywhere — every number on the site is real.
