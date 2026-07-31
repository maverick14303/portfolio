# Portfolio — Build Handoff Plan

> **Status:** ✅ SHIPPED 2026-07-20 — live at https://ankit-keshari.vercel.app (see README.md for how to update). This document is kept as the original design brief.
> **Audience of this document:** a future **Claude Code build session**. This is a complete handoff — the builder may be a session with zero context. Follow it literally. Where this document says ASK, you must ask the user and wait; assuming instead of asking is a build failure.
> **Prime directive:** never invent facts about the user, never fill content gaps with plausible-sounding filler, never skip an interview gate to "save time."

## 0. The user (so you don't ask what's already known)

Ankit — student at NIT Delhi, India. AI builder, learning DSA, preparing for campus + off-campus placements; also building a freelance/AI-services lane via LinkedIn. Pronouns unstated — use they/them or "the user" in anything user-visible. Cost constraint: free tiers only (a paid custom domain may come later, user's own purchase). The user dictates by voice — expect informal phrasing; confirm understanding rather than guessing intent.

## 1. What is being built

A personal portfolio website that makes a recruiter conclude "this student is exceptional" within 60 seconds, with a secondary lane for freelance/AI-service clients.

- **Interactive, responsive 3D hero** — a striking WebGL scene reacting to cursor/touch — plus **scroll-driven 3D moments** between sections. All actual content (projects, about, services, contact) is crisp, skimmable HTML — never trapped inside WebGL.
- **The user's portrait woven into the hero with a WebGL treatment** (particle dissolve, depth-map parallax, or shader hover effect — builder proposes 2–3 treatments, user picks). Additional styled photos in About.
- **Mood — default lean, not a lock:** dark, technical, cinematic (near-black, glowing accents, shaders, monospace flourishes). BUT the user has said the final mood may follow the example sites they paste at build time. Derive direction from their examples, present the derived direction back for approval, and only then style anything (see Gate 2).
- **Optional add-on (do NOT build unless the user explicitly asks): a full 3D world** — an immersive navigable scene on its own route (e.g. `/world`), linked from the main site as an easter-egg/showcase. It never replaces the recruiter-skimmable main site. Keep this option alive in code structure (scenes modular), but it is out of scope until requested.

Inspiration pool the user cited: https://github.com/emmabostian/developer-portfolios (they will also paste specific examples — those outrank the repo).

## 2. Interview gates (mandatory, in order, before any code)

**Gate 1 — Content interview.** Collect and write into `/content` before building:
1. **Photos:** ask the user to drop photos into `content/photos/`. Minimum: 1 strong hero portrait (highest resolution available), 1–3 casual/About photos. Ask which is the hero.
2. **Projects:** for EACH project — name, one-line pitch, what it actually does, tech stack, the user's specific role, outcomes/numbers if any, repo link, live link, 1–2 screenshots if available. Known candidates to ask about (verify, don't assume): whisperflow-local (offline dictation app), NSE trading bot, chief-of-staff (if built by then), sunday-lets-get-a-job (if built by then), anything else. Ask "which 3–5 projects go on the site, and in what order?"
3. **Bio/about:** short bio in the user's voice (interview them; draft it; get approval), education line (NIT Delhi, branch, year), what they're currently building/learning.
4. **Links:** GitHub, LinkedIn, X/Twitter, email, resume PDF (ask for the file), anything else.
5. **Services lane:** what AI services they offer, for whom, and the desired action (email? LinkedIn DM? booking link?). If the user hasn't defined services yet, the section becomes a single crisp line + contact — agreed cut, not a placeholder.
6. **Skills:** actual list (languages, frameworks, tools) — ask, don't infer from projects.

Rules: every section either has REAL content or is consciously cut by the user in this interview. No lorem ipsum, no "TODO", no invented testimonials/metrics — ever.

**Gate 2 — Design direction.** Ask the user to paste their example sites/links. From those + the dark/technical/cinematic default lean, produce a short written direction (palette, type pairing, motion character, hero concept in one paragraph, portrait-treatment options). Present it; iterate until the user approves. Load the `frontend-design` skill for this phase. Only after approval, build.

**Gate 3 — Anything else.** Standing rule for the whole build: if a decision materially shapes the result and this document doesn't settle it, ASK the user (AskUserQuestion with a recommended option) instead of assuming. This is the user's explicit instruction.

## 3. Site structure (single page + routes)

```
/            one-page flow: Hero(3D) → Projects → About → Skills → Services → Contact
             sticky minimal nav + "Resume" button (PDF) always reachable
/world       (OPTIONAL, only on explicit request) full 3D world route
```

- **Hero:** 3D scene + portrait treatment + name + one-line positioning + two CTAs ("See projects", "Hire me / Contact").
- **Projects:** cards with screenshots, stack chips, outcome line, repo/live links. Scroll-driven 3D/motion transitions between cards or into the section. Content must be skimmable with JS disabled in principle (semantic HTML under the flair).
- **About:** bio + styled photos + education + current focus.
- **Skills:** honest, compact — no skill bars with fake percentages.
- **Services:** the client lane — what the user offers + clear contact action.
- **Contact:** email + socials; a form only if the user asks (forms need a backend/service — ask, default is mailto + links).

## 4. Stack (decided — do not relitigate without user request)

| Piece | Choice |
|---|---|
| Framework | **Next.js** (App Router, static export where possible) |
| 3D | **React Three Fiber** + drei + @react-three/postprocessing (Three.js under the hood) |
| Motion | **Framer Motion** for UI; GSAP ScrollTrigger or Lenis **only if** the scroll choreography needs it |
| Styling | Tailwind CSS |
| Content | Typed content files: `content/*.json` / MDX — NO CMS. Post-launch updates happen by the user opening this folder in Claude Code and saying "add project X" |
| Hosting | **Vercel free tier**, `*.vercel.app` subdomain now. Custom domain: user may buy one later (their own purchase — never handle payment); document the Vercel domain-wiring steps in README when that happens |
| Analytics | None by default. ASK if the user wants Vercel Analytics (free) |

```
portfolio/
  PLAN.md            ← this file
  content/           ← photos/ + site.json + projects.json + resume.pdf  (the ONLY place content lives)
  app/               ← Next.js routes & sections
  components/three/  ← hero scene, portrait treatment, scroll scenes (modular — /world reuses these)
  components/ui/     ← nav, cards, sections
  lib/               ← content loaders (typed), device-capability detection
```

## 5. Performance & resilience budget (non-negotiable)

Recruiters open portfolios on phones and old ThinkPads on college Wi-Fi. The wow must never cost the read.

- **Fallbacks:** WebGL unavailable / low-power device / `prefers-reduced-motion` → serve a static, still-beautiful hero (styled portrait + typography). Detect via capability check, not user-agent guessing. The site must be 100% consumable with zero WebGL.
- **Budgets:** hero interactive < 3s on a mid phone; total JS for the non-3D path kept lean (3D bundles lazy-loaded, `next/dynamic`, suspense placeholder that looks intentional); images via `next/image`, portrait pre-optimized.
- **Mobile:** every section designed mobile-first; the 3D hero must have a touch behavior, not just a cursor one.
- **Accessibility:** semantic landmarks, alt text on all photos (ask the user for alt text of their own portrait), visible focus states, reduced-motion honored everywhere, contrast checked on the dark palette.
- **SEO/social:** proper title/description, OpenGraph image (generate one from the hero look), name searchable.

## 6. Milestones (each has a verify step; do them in order)

1. **Gates 1–2 complete:** `/content` populated with real content; approved design direction written down. *Verify: user has explicitly approved content list + direction.*
2. **Skeleton + content pipeline:** Next.js app, typed content loaders, all sections rendering real content, deployed to Vercel, mobile-checked. No 3D yet. *Verify: user opens the vercel.app URL on their phone; every section shows their real content.*
3. **3D hero + portrait treatment:** scene + portrait effect + fallback path. *Verify: hero runs smoothly on the user's phone; disabling WebGL in devtools still yields a presentable hero; reduced-motion honored.*
4. **Scroll choreography + polish:** section transitions, micro-interactions, OG image, favicon, 404. *Verify: full scroll-through on phone + laptop feels cohesive; Lighthouse perf/accessibility sanity pass.*
5. **Launch review:** user does a full pass, final tweaks, resume PDF wired, links checked. *Verify: user says "ship it"; URL goes on their LinkedIn/resume.*

## 7. Risks & standing decisions

- **Biggest risk — spectacle over substance:** if any 3D choice fights skimmability, skimmability wins. The 3D IS evidence of skill, but projects close the deal.
- **Content is the bottleneck, not code:** Gate 1 exists because a gorgeous shell with thin content fails its one job. Do not let the user rush past it.
- **Decided (don't re-open unless the user does):** recruiter-first with client lane · 3D hero + scroll moments (not full-world) as the main build · portrait WebGL treatment · content in files, no CMS · free vercel.app now, custom domain later · dark/technical/cinematic as default lean with example-driven override · no fake metrics/testimonials/skill-bars.
- **/world route:** only on explicit user request, after the main site ships. If they ask, plan it as its own mini-project reusing `components/three/`.
