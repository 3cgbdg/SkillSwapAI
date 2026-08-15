# UI/UX redesign

## Assumptions

The request — "redo the whole UI and UX ... FULLY" — is unbounded as written.
It could mean anything from a re-theme to re-architecting the information
architecture. I did not silently pick one reading; here is the boundary I
chose and why.

**A1 — Scope boundary: presentation layer only, top-down through the enforced
layering.** This plan rebuilds (a) the token layer in
`frontend/src/styles/globals.css`, (b) the sizing/variants of the primitives in
`frontend/src/components/ui/`, (c) `frontend/src/components/composites/`, (d)
`frontend/src/components/layouts/`, and (e) the *presentational* markup of the
product screens under `frontend/src/app/(main)/**` and their feature components
under `frontend/src/components/{matches,profile,chat,inbox,calendar}/`.

Justification from the code, not from principle: `frontend/eslint.config.mjs`
lines 61–82 forbid route code from setting `rounded-*`, `shadow-*`, `border*`
and arbitrary sizes, and lines 33–52 forbid gray-family utilities and raw hex
repo-wide. That means visual decisions *structurally cannot* live in route
code — they already have to live in the token/primitive/composite layers. A
redesign that lands there propagates to every screen without touching data
flow. That is the highest-leverage shape available in this specific repo.

**A2 — Information architecture is unchanged.** The six nav destinations in
`frontend/src/constants/navLinks.tsx` (Home, Discover, Learning, Schedule,
Inbox, Profile), the route groups `(auth)` / `(main)` / `(chat)`, and the
existing redirects (`/matches`→`/discover`, `/calendar`→`/schedule`,
`/chats`→`/inbox`) stay as they are. The complaint was aesthetic
("looks bad ... boring"), not navigational. If IA change is wanted, that is a
separate plan.

**A3 — "Good breath" is read as vertical rhythm and control density**, and it is
measurable: see Current state §2. Acceptance criteria below convert it into
numbers rather than adjectives.

**A4 — Browser-driven verification already exists in this repo and this plan
uses it; only snapshot-diffing tooling is excluded.** The repo-root `.mcp.json`
configures a project-scoped `playwright` MCP server, and
`frontend/.claude/skills/e2e-check/SKILL.md` exists specifically to drive the
running frontend through a real browser — navigate, interact, screenshot, check
the console for errors and the network for 4xx/5xx. Every step below is verified
through that skill, not by unaided eyeballing. What is *not* assumed is
automated **visual-regression / snapshot-diffing** (Chromatic, Playwright
`toHaveScreenshot` baselines) — that is a separate tooling project and stays in
Out of scope. There is exactly one frontend test today
(`frontend/src/utils/user.test.ts`).

**A4a — The browser gate has a real prerequisite chain, and it is not free —
but the user has confirmed they can run it.** Full verification is the
**intended path**: Docker, a Joi-valid `backend/.env` with `OPENAI_API_KEY` and
the four `AWS_*` vars, `prisma migrate` + `db seed`, both dev servers and a
browser signup are all available. The "partially verified" fallback further
down is a genuine fallback, not the expected mode — treat a step that skips the
browser gate as an exception needing a stated reason, not as normal practice.
The prerequisite detail below is retained because it is what makes the gate
reproducible.
I checked what driving an authenticated `(main)` route actually requires:
`e2e-check`'s own Prerequisites say it "does not manage the backend," pointing
at `backend/.claude/skills/run-backend/SKILL.md`, which needs Docker Desktop
running (Postgres + Redis via the repo-root `docker-compose.yaml`) and a
fully-populated `backend/.env` — `src/config/env.validation.ts` validates with
Joi at boot, so the app will not start without `JWT_SECRET`,
`JWT_REFRESH_SECRET`, `OPENAI_API_KEY` and the four `AWS_*` vars.
**And there is no usable seeded login.** `e2e-check` allows for one
("unless a test user already exists from `backend`'s Prisma seed data"), but
`backend/prisma/seed.ts:229–241` creates only `isBot: true` users with
randomly-generated faker emails and the literal string
`password: 'bot_account_no_login'` — not a hash — so none of them can
authenticate. The authenticated session must therefore be established by
driving the real signup flow in the browser **once per verification session**,
after which the httpOnly `access_token`/`refresh_token` cookies persist in the
browser context across steps. This is executable, but it is a five-minute setup
before the first step, not a per-step cost. See "Verification setup" below.

**A5 — Copy is edited only where it is a visual artefact** (e.g. the literal
`"Bio:"` and `"Benefits:"` labels with trailing colons). A product-wide
copywriting pass is out of scope.

If any of A1–A5 is wrong — particularly A2 — say so before step 1, because
steps 8–13 are ordered around them.

---

## Goal and acceptance criteria

### Goal

Rebuild SkillSwap's visual system so the product surface reads as a calm,
purposeful, reciprocal-learning product rather than a dense admin dashboard:
raise control density and vertical rhythm to a comfortable scale, give the
teach↔learn duality a consistent and accessible visual grammar, and make every
`(main)` screen consume the shared page frame instead of inventing its own.

### Design direction (the visual thesis)

Two implementers reading this should converge on the same look.

**Name it:** *Warm paper, cool ink, two currents.* The app is a place where two
people trade knowledge; the page is the workbench, and the only saturated
colour on it marks who is teaching and who is learning.

1. **Palette intent.** Keep the existing hue family — warm off-white paper
   (`--background: oklch(0.99 0.006 85)`), cool plum ink
   (`--foreground: oklch(0.24 0.02 285)`), plum primary, amber `--brand-accent`.
   Two changes:
   - **Break the flat gray.** Today `--muted`, `--secondary` and `--accent` are
     the *same value* (`oklch(0.97 0.014 75)` light; `oklch(0.28 0.02 285)` dark
     — `globals.css:125–130` and `198–202`). That single tone is a primary
     reason the app reads flat: there is no surface ladder, so a card, a chip
     and a hover state are all the same colour. Split them into three distinct
     steps so depth is readable without relying on shadow.
   - **Saturation is rationed.** Chroma above ~0.10 appears only on: the
     primary action, the teach accent, the learn accent, and destructive.
     Everything else is neutral. This is what makes the accents mean something.
2. **Type scale.** Extend from today's 3 steps (`--text-display`, `--text-h1`,
   `--text-h2`, `globals.css:46–56`) to a 6-step scale — `display, h1, h2, h3,
   body, body-sm` — with body at **16px, not 14px**. Body currently defaults to
   `text-sm` (98 occurrences of `text-sm` vs 8 of `text-base` across
   `src/**/*.tsx`); 14px body is the single loudest "dense admin tool" signal.
   `--font-heading` (Fraunces) is used for headings and card titles only;
   `--font-sans` (Inter) for everything else. Heading tracking stays negative
   (`-0.015em`/`-0.02em`, already defined); body tracking is 0.
3. **Spacing rhythm.** 8px base. Three named rhythm tokens, consumed by
   layout components, never by route code: **page** (space between page frame
   and content), **section** (space between `PageSection`s — target `2.5rem`,
   up from today's `gap-8` = 2rem in `PageBody.tsx:13`), **stack** (space inside
   a section — `1rem`). Card interior padding moves from
   `--card-spacing: --spacing(4)` (16px, `card.tsx:7`) to 24px. The dead
   `--page-gutter` and `--content-max` tokens (`globals.css:144–145`) get wired
   into `Container` — see Current state §5.
4. **Elevation / depth strategy.** Three legible steps, in this order of
   preference: **surface colour first, hairline second, shadow last.** Today
   `elevation="flat"` is `ring-1 ring-foreground/10` and shadows sit at 4–8%
   alpha (`globals.css:158–163`), which is why cards read as faint boxes on an
   almost-identical background. New ladder: `flat` = `--surface` + hairline;
   `raised` = `--surface-raised` + `--shadow-sm`; `interactive` = `raised` plus
   the existing hover lift. Dark mode inverts the logic — depth comes from
   *lighter* surface, shadow is secondary (dark shadows are already 40–50%
   alpha and carry the weight, `globals.css:214–216`).
5. **Motion posture.** Entrance-only and short. Reuse the existing
   `--duration-fast/base` (120/180ms) and `--ease-out`; adopt the currently-dead
   `--ease-spring` and `--duration-slower` only for the teach↔learn swap
   affordance. **No continuous/looping motion, no parallax, no scroll-linked
   animation.** The `prefers-reduced-motion` block at `globals.css:105–111`
   must cover every new keyframe.
6. **How teach vs learn is expressed.** This is the "destination" the user asked
   for, and it is the one idea the current UI already has and squanders.
   - **Fixed grammar, everywhere:** teach = `--accent-teach` (cool teal, hue
     200), learn = `--accent-learn` (warm orange, hue 45). Teach is always
     rendered *before* learn. Icon pairing is fixed: `GraduationCap` for teach,
     `BookOpen` for learn (these are already the two used in
     `components/profile/Profile.tsx:10`).
   - **A `SwapAxis` composite** becomes the signature element: a two-column
     teal-left / orange-right block joined by a `↔` glyph, rendering "they
     teach X ↔ they want Y". It replaces the two stacked
     `Teaches` / `Wants to learn` label blocks in
     `components/matches/MatchCard.tsx:180–191` and the two identical cards in
     `components/profile/ProfileView.tsx:33–66`.
   - **Fix the metaphor bug:** `ProfileView.tsx:28` renders *both* "Skills I
     Know" and "Skills I Want to Learn" with `variant="teach"`. The duality is
     literally broken on the profile screen today.

### Acceptance criteria

Verifiable conditions. Each is checkable by a command or a numeric inspection.

**Tokens and scale**

- A1. `frontend/src/styles/globals.css` defines a 6-step type scale
  (`--text-display`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-body`,
  `--text-body-sm`), each with `--line-height` and `--letter-spacing`
  companions, in the `@theme inline` block.
- A2. `--muted`, `--secondary`, `--accent` hold three *different* oklch values
  in `:root` and three different values in `.dark`. (Today: identical.)
- A3. No dead tokens remain. `--page-gutter`, `--content-max`,
  `--duration-slower` and `--ease-spring` are each referenced by at least one
  component file; **`--pane-min` is deleted from `globals.css`** rather than
  wired up, because step 13 deletes `SplitPane` (its only plausible consumer)
  instead of adopting it (step 13 explains why). Verified by, for
  the four surviving tokens:
  `grep -rl -- "<token>" frontend/src --include=*.tsx --include=*.css`
  returning more than just `globals.css`; and for `--pane-min`, the same grep
  returning **nothing at all**. (Today all five are `globals.css`-only.)
- A4. No `--radius-*` step is left unreferenced, or the unused steps are
  deleted.

**Density / "breath"**

- A5. Default `Button` size renders ≥ 40px tall and `icon` ≥ 40px
  (today `h-8` at `button.tsx:25`, `size-8` at `:29`). `Input` and `Textarea`
  default ≥ 40px (today `h-8`, `input.tsx:12`). `Badge` ≥ 24px (today `h-5`,
  `badge.tsx:8`). The compact `sm`/`xs`/`icon-sm`/`icon-xs` variants remain
  available for dense contexts (toolbars, message-bubble retry buttons).
- A6. `--card-spacing` default is 24px (`--spacing(6)`), `sm` is 16px.
- A7. `PageSection`-to-`PageSection` gap is ≥ 2.5rem on `md+`.
- A8. Counted across `frontend/src/app/**/*.tsx` and
  `frontend/src/components/{matches,profile,chat,inbox}/**/*.tsx`, occurrences
  of `\b(gap|space-y|space-x)-(1|1\.5|2|2\.5|3)\b` fall from the measured
  baseline of **73 to ≤ 36** (≥50%). Note this is *not* the 191 figure quoted in
  Current state §2 — that covers all of `frontend/src` including
  `components/ui/**`, where tight gaps are correct for icon/label pairs and are
  deliberately untouched. Exact command in step 5; re-run in step 15.
- A9. Body copy in `(main)` routes uses the `body` type step (16px), not
  `text-sm`. **The base rule alone cannot achieve this**, because the
  primitives hard-code their own size in their CVA base class: `card.tsx:7`
  carries `text-sm text-card-foreground`, `button.tsx:8` carries `text-sm`,
  `badge.tsx:8` carries `text-xs` — and nearly every `(main)` surface renders
  inside a `Card`. Verified by grep, not by eye:
  `grep -nE '\btext-(sm|xs)\b' frontend/src/components/ui/{card,button,badge}.tsx`
  returns no match in the **base** (first) argument of each `cva()` call. Size
  variants (`Button` `sm`/`xs`) may still set a smaller step deliberately.

**Consistency of the page frame**

- A10. Every **content-bearing** route under `frontend/src/app/(main)/` renders
  its heading through `PageHeader` from `@/components/layouts` — including via
  feature components. Today `PageHeader` has **zero** consumers. The full
  enumeration, with the step that owns each, is:
  `/dashboard` (8), `/discover` + `/learning` (10), `/matches/[id]` (11),
  `/profile` + `/profiles/[id]` (12), `/inbox` (13), `/schedule` (14).
- A11. The same routes wrap content in `PageBody` and group it with
  `PageSection`. Today only `dashboard/page.tsx` does.
- A10/A11 exemptions — **these are exempt by design, not by omission**, and
  step 15's enumeration must match this list exactly:
  - **Redirect-only routes** render no UI: `matches/page.tsx`,
    `matches/active/page.tsx`, `calendar/page.tsx`, `(chat)/chats/page.tsx`.
  - **`/profile/edit`** — a single-purpose form. A page frame would add a second
    heading above a form that already has one, and step 12 explicitly limits
    `EditProfile.tsx` to a one-line mechanical lift. Migrating it is deliberately
    unbudgeted; see Out of scope #13.
  - **`/inbox/[id]` (i.e. `(chat)/chats/[id]`)** — a chat thread. `ChatThread`
    renders its own in-`Card` header with the partner's avatar and presence; a
    `PageHeader` above it would duplicate that. Step 13 owns the file and
    deliberately leaves it frameless.
- A12. No `<h1>`/`<h2>`/`<h3>` in `src/app/**` or
  `src/components/{matches,profile,chat,inbox}/**` sets an ad-hoc Tailwind size
  utility (`text-2xl`, `text-3xl`, `text-xl`, `leading-6/7/8/9`).
  `components/calendar/**` is excluded — no step restructures it (Out of scope
  #8). Verified by grep in step 15.
- A13. `Container` derives its width and gutter from `--content-max` /
  `--page-gutter` rather than the hard-coded `max-w-7xl px-4 md:px-6`
  (`components/layout/Container.tsx`).

**Teach/learn metaphor**

- A14. A `SwapAxis` composite exists in `frontend/src/components/composites/`,
  is exported from that folder's `index.ts` barrel, and is used by at least
  `MatchCard` and `ProfileView`.
- A15. `ProfileView` renders "Skills I Know" with the teach treatment and
  "Skills I Want to Learn" with the learn treatment (bug fix).
- A16. A vitest test asserts teach-before-learn ordering and correct
  variant-per-side in `SwapAxis`, and that `SkillPillList` maps
  `variant="learn"` to the learn token. Runs green under
  `pnpm --dir frontend exec vitest run src/components/composites/SwapAxis.test.tsx`.

**Accessibility (both themes)**

- A17. All of the following pass WCAG AA in **both** light and dark: body text
  on `--background`, `--muted-foreground` on `--background` and on `--muted`,
  teach badge foreground on teach-soft, learn badge foreground on learn-soft,
  `--success` used as text, `--primary-foreground` on `--primary`.
  Current failures, measured (light theme only — dark already passes):
  teach badge **2.90:1**, learn badge **2.63:1**, `--success` as text
  **3.61:1**, `--accent-learn` on background **2.94:1**. Verified by the
  checked-in script from step 1.
- A18. Non-text UI contrast ≥ 3:1 in **both** themes for: focus ring against
  adjacent surface, input/outline-button border against its background, and
  `--brand-accent` where used as a standalone icon (today **2.00:1** light, used
  at `dashboard/page.tsx:279`).
  **`--input` must be given a distinct value in `:root` *and* in `.dark`.**
  Today it is `var(--border)` in both (`globals.css:139` and **`:212`**), and
  `--border` measures **1.35:1** light / **1.51:1** dark against `--background`
  — so the dark-mode failure is identical to the light one, and un-aliasing
  only `:root` would leave A18 permanently unsatisfiable. This is safe to do in
  dark: `--input` is a non-text border token, so it does not touch any of the
  text pairs that dark currently passes.
- A19. Every interactive target in `(main)` is ≥ 44×44 CSS px, or has ≥ 44px of
  hit area via padding. Direct consequence of A5.
- A20. Every animation added by this work is disabled under
  `@media (prefers-reduced-motion: reduce)` in `globals.css`.
- A21. `pnpm --dir frontend lint` reports **0 errors** (baseline today: 0 errors,
  10 warnings — the warning count must not increase).

**Gates**

- A22. `pnpm --dir frontend exec tsc --noEmit` clean.
- A23. `pnpm --dir frontend test` green.
- A24. `pnpm --dir frontend format:check` clean.
- A25. `pnpm knip` reports no new unused exports/files (relevant because this
  plan deletes or adopts currently-dead primitives — see Current state §3).
- A26. `pnpm --dir frontend build` succeeds.
- A27. After **each** step, the step's browser gate passes via the `e2e-check`
  skill (`frontend/.claude/skills/e2e-check/SKILL.md`) driving the `playwright`
  MCP server. "Passes" means all three of:
  (i) the step's named routes render without layout breakage,
  (ii) a screenshot is captured at each named route in **both** themes, and
  (iii) the browser console is **free of new errors** and the network shows no
  unexpected 4xx/5xx. Per the skill's own step 5, "a screenshot that looks right
  with a console error underneath is not a pass."
  Scope is tiered so this stays executable rather than becoming 300 checks:
  - **Token/primitive steps (1–6)** run the fixed **smoke set** —
    `/dashboard`, `/discover`, `/inbox` — at 1280px and 390px, both themes.
    These steps have global blast radius, so the set is fixed and small.
  - **Screen steps (7–14)** run the smoke set at 1280px only, **plus** the
    step's own named routes at both widths and both themes, **plus** the one
    edge case named in that step (empty state, overflow, or error path) —
    `e2e-check` step 4 requires an edge case, not just the happy path.
  - **Step 15** runs the full matrix plus a keyboard-only traversal.

---

## Current state

Evidence from files I opened. Everything below is cited.

### 1. The token layer is better than the complaint implies — and that changes the diagnosis

`frontend/src/styles/globals.css` (242 lines) already has more than a default
shadcn install:

- A full oklch light/dark palette (`:root` lines 114–185, `.dark` lines
  187–229), warm paper background `oklch(0.99 0.006 85)` on cool plum ink
  `oklch(0.24 0.02 285)`.
- **The teach/learn duality already exists as tokens**: `--accent-teach`
  (hue 200 teal) / `--accent-teach-soft`, `--accent-learn` (hue 45 warm) /
  `--accent-learn-soft`, plus `--brand-accent` amber (lines 131–135).
- A 7-step radius scale derived from `--radius: 0.75rem` (lines 36–42).
- A named elevation ladder `--elev-shadow-sm/md/lg`, theme-aware (lines
  158–163, 214–216).
- Motion tokens: `--duration-fast/base/slow/slower`, `--ease-out`,
  `--ease-spring` (lines 152–157), `fade-up`/`fade-in` keyframes, **and a
  correct `prefers-reduced-motion` block** (lines 105–111).
- Layout tokens `--header-h`, `--sidebar-w`, `--page-gutter`, `--content-max`,
  `--pane-min` (lines 141–146) and a z-index scale (147–151).
- Six semantic session colours for the calendar (lines 173–184 / 217–228).

So the app is not boring for lack of a design system. It is boring because of
four specific properties of that system:

- **(a) Everything mid-tone is one colour.** `--secondary`, `--muted` and
  `--accent` are all exactly `oklch(0.97 0.014 75)` in light (lines 125–129) and
  all exactly `oklch(0.28 0.02 285)` in dark (lines 198–202). There is no
  surface ladder, so nothing recedes or advances.
- **(b) The type scale stops at h2.** Only `--text-display`, `--text-h1`,
  `--text-h2` exist (lines 46–56). There is no h3 and no body step, so every
  screen improvises — see §4.
- **(c) Shadows are effectively invisible in light mode.** 4–8% alpha
  (lines 158–163) against a `0.99`-lightness background.
- **(d) Five tokens are dead.** `--page-gutter`, `--content-max`, `--pane-min`,
  `--duration-slower`, `--ease-spring` appear only in `globals.css`. Verified:
  `grep -rl` for each returns `./styles/globals.css` alone.

### 2. The primitives are sized for a dense admin tool

This is the concrete, measurable source of "cramped":

| Primitive | File:line | Current | Note |
|---|---|---|---|
| `Button` default | `components/ui/button.tsx:25` | `h-8` (32px), `px-2.5` | below the 44px touch target |
| `Button` sm / xs | `button.tsx:27` / `:26` | `h-7` / `h-6` | 28px / 24px |
| `Button` icon | `button.tsx:29` | `size-8` | 32px |
| `Button` base class | `button.tsx:8` | `text-sm` | hard-coded in the CVA base |
| `Input` | `components/ui/input.tsx:12` | `h-8`, `py-1` | 32px form fields |
| `Badge` | `components/ui/badge.tsx:8` | `h-5`, `text-xs` | 20px pills |
| `Card` padding | `components/ui/card.tsx:7` | `--card-spacing: --spacing(4)` | 16px |
| `Card` base class | `card.tsx:7` | `text-sm text-card-foreground` | **overrides the body base rule** |
| `AppShellMain` | `components/layouts/AppShell.tsx:76` | `py-2 sm:py-6 md:py-8` | **8px** top/bottom on mobile |
| `PageBody` gap | `components/layouts/PageBody.tsx:13` | `gap-8` | 2rem between sections |

The two "base class" rows matter more than they look: because `cardVariants`
sets `text-sm` on every `Card`, and nearly every `(main)` surface is inside a
`Card`, changing only the `@layer base` `body` rule would leave card interiors
at 14px. Steps 4 and 5 handle this explicitly.

Corpus-level density measurements across `frontend/src/**/*.tsx`:

- `text-sm`: **98** occurrences. `text-xs`: **42**. `text-base`: **8**.
  14px is the de-facto body size.
- `\b(gap|space-y|space-x)-(1|1\.5|2|2\.5|3)\b`: **191** matches across
  **60** files.
- `\b(gap|space-y)-(6|8|10|12|16)\b`: **27** matches across **16** files.

A 7:1 ratio of tight-to-generous spacing utilities is the numeric form of
"cramped".

### 3. The layout/composite layer exists but is barely adopted — this is the real problem

Inventory (`frontend/src/components/`):

- `layouts/` (6 files, barrel at `layouts/index.ts`): `AppShell` +
  `AppShellMain`, `AuthSplitPane`, `DetailPane`, `PageBody` + `PageSection`,
  `PageHeader`, `SplitPane`.
- `composites/` (13 files, barrel at `composites/index.ts`): `AsyncBoundary`,
  `DataEmpty`, `FloatingPanel`, `MatchProgressPanel`, `MetricRing`,
  `SectionPanel`, `SegmentedControl`, `SkeletonKit`, `SkillPill` +
  `SkillPillList`, `StatTile`, `Stepper`, `TaskChecklistLink`, `UserRow`.
- `ui/` (34 shadcn `base-nova` primitives).

Adoption, measured by grepping for consumers outside the defining folders:

| Primitive | Consumers |
|---|---|
| `PageHeader` | **0** |
| `SplitPane` | **0** |
| `DetailPane` | **0** |
| `SkillPill` (single) | **0** (only `SkillPillList` is used) |
| `PageBody` / `PageSection` | **1 route** — `app/(main)/dashboard/page.tsx` |
| `SectionPanel` | **1** — `components/profile/Profile.tsx:141` |
| `StatTile` | 3 |
| `DataEmpty` | 7 |
| `AsyncBoundary` | 9 |

`knip.json` hides this: `ignoreIssues` suppresses `exports` for
`frontend/src/components/layouts/**` and `composites/**`, so the dead
primitives never surfaced in CI.

The consequence is that **there is no shared page frame**, so every screen
reinvents spacing and headings. That, more than any colour choice, is why the
app feels inconsistent and unremarkable.

### 4. The real screens, and what is concretely wrong with each

Routes under `frontend/src/app/`:

**`(auth)` group — already the best-looking part of the app.**
`app/(auth)/layout.tsx` → `components/layouts/AuthSplitPane.tsx`: a two-pane
marketing split with the `SkillSwapMark` illustration, two blurred glow shapes,
`font-heading text-display`, `gap-10` / `gap-5`, `size-9` icon chips, and a
real value-prop list. This is airy and on-brand. **The gap between this and the
product surface is the clearest evidence for the user's complaint**: the
marketing pane is designed; the app behind the login is not.

**`(main)/dashboard/page.tsx` (287 lines)** — the only screen using the page
frame (`PageBody` + 4× `PageSection`). Problems: the hero is a hand-rolled
`Card` with `md:p-8` rather than a composite (lines 73–119); body copy is
`text-sm` throughout (lines 80, 84, 164); stat/quick-link grids use `gap-3`
(lines 231, 255); `QuickLink` (lines 266–285) is a locally-defined card that
duplicates what a composite should own; `text-brand-accent` icons at
`size-8` (line 279) fail non-text contrast (2.00:1, see §6).

**`(main)/discover` + `(main)/learning`** → both render
`components/matches/Matches.tsx` (265 lines) via
`app/(main)/discover/DiscoverPageContent.tsx`. Problems: renders its own
`<h1 className="font-heading text-h1">` (line 164) instead of `PageHeader`;
`gap-7.5` (line 146) — an off-scale value; `min-w-[220px]`,
`min-w-[240px]`, `min-w-[200px]`, `max-w-[450px]` arbitrary sizes (lines 181,
199, 205, 223). These are off-scale magic numbers worth removing on design
grounds, but — contrary to intuition — they are **not** ESLint violations even
under `src/app/**`, because the rule's `[hwp]-\[` is whitespace-anchored and
does not match `min-w-[`/`max-w-[`. See §7.

**`components/matches/MatchCard.tsx` (250 lines)** — carries the most product
weight. The teach/learn block (lines 180–191) is two stacked
`text-xs uppercase` labels with `gap-1.5` — visually the two currents read as
one list. `MetricRing` is absolutely positioned at `top-4 right-4` (line 170)
and overlaps `pr-12` reserved space (line 148), which is fragile. The footer
dropdown trigger is a hand-rolled `size-7` (28px) button with inline
`rounded-lg border` (lines 210–213) — below touch target and bypassing
`Button`.

**`(main)/matches/[id]/page.tsx` (235 lines)** — the plan detail screen, and
the worst offender for type inconsistency. **Four ad-hoc heading treatments on
one screen**: `text-h1 leading-9` (116), `text-xl leading-7 font-semibold`
(124), `text-2xl font-bold leading-8` (143, 182), `text-3xl font-bold
leading-9` (205). Also `grid gap-8 grid-cols-3` (line 113) with no mobile
breakpoint on the grid itself, `<ol className="list-disc">` (line 125 —
ordered list styled as unordered), and the literal label `"Benefits:"` (124).

**`(main)/profile/page.tsx`** → `components/profile/Profile.tsx` →
`components/profile/ProfileView.tsx` (112 lines). Problems:
**`ProfileView.tsx:28` uses `variant="teach"` for both the "Skills I Know" and
"Skills I Want to Learn" lists — the core metaphor is broken on the profile
screen**; magic number `pt-[21px]` (lines 35, 49); `text-3xl font-bold
leading-9` name (78) and `text-2xl leading-6` card titles (37, 51 — line-height
*smaller* than font-size); `flex items-start justify-center gap-6 md:grid
md:grid-cols-5` (69) mixes two layout systems; literal `"Bio:"` and
`"Actions:"` labels (90, 96); the whole skills block is duplicated for mobile
and desktop (102–109).

**`(main)/(chat)` group** — `app/(main)/(chat)/layout.tsx` renders
`ChatSidebar` + children inside `min-h-[min(75dvh,800px)]` with `gap-4`.
`app/(main)/(chat)/inbox/page.tsx` uses `SegmentedControl` + `gap-4`.
`components/chat/ChatThread.tsx` puts the thread in a `Card` with
`px-4 py-4 md:px-6` header and `p-4 md:p-6` body — reasonable, but message
groups are `gap-3`/`gap-1` (`ChatMessageList.tsx`) and the date separator chip
is `text-xs` on `bg-muted/60`. `SplitPane` and `DetailPane` were clearly built
for this group and are unused; the chat layout hand-rolls its own flex split
instead. Note `SplitPane.tsx:26` hard-codes the *same*
`min-h-[min(75dvh,800px)]` as `(chat)/layout.tsx:37` — so it carries the same
viewport bug, which is why step 13 deletes it rather than adopting it.

**`(main)/schedule/page.tsx`** — `text-2xl font-bold leading-8` heading
(line 37), no `PageHeader`, no `PageBody`.

**Error/404** — `app/not-found.tsx` and `app/(main)/error.tsx` are both a
centred `Card elevation="raised"` with a title, description and one button.
Functional, characterless, no illustration (unlike `DataEmpty`, which does use
`WarmScholarEmptyArt`).

### 5. Fonts and layout primitives

`frontend/src/app/layout.tsx`:

- Fonts are loaded with `next/font/google` — `Fraunces` → `--font-fraunces`
  (lines 12–15) and `Inter` → `--font-inter` (17–20), wired to `--font-heading`
  / `--font-sans` in `globals.css:9–10`.
- **Neither declares `weight` or `axes`.** Fraunces is a variable font with
  `SOFT`, `WONK` and optical-size axes; without configuration the distinctive
  character never appears. And `font-heading` is applied in only a handful of
  places (`PageHeader.tsx:30`, `card.tsx:62`, `AuthSplitPane.tsx`,
  `Sidebar.tsx`, `ChatThread.tsx`), so the serif/sans contrast that would give
  the product personality is barely visible.
- There *is* a correct skip-link (lines 39–44) and `suppressHydrationWarning`
  for the theme.

`components/layout/Container.tsx` hard-codes `mx-auto w-full max-w-7xl px-4
md:px-6` — it **ignores** the `--content-max: 80rem` and `--page-gutter: 1rem`
tokens defined for exactly this purpose. Only `AppShellMain` and `Footer`
consume `Container`, so max-width/gutter is otherwise ad-hoc per screen.

`components/layout/MobileTabBar.tsx` exists but is **never imported**
(grep returns only its own definition), and `AppShell` accepts a `mobileNav`
slot (`AppShell.tsx:16, 59`) that `app/(main)/layout.tsx` never fills. Mobile
navigation is therefore sidebar-only, behind a `SidebarTrigger` in the header.
`knip.json` explicitly ignores `MobileTabBar.tsx`, so this never surfaced.

### 6. Empty / loading / error states

- `composites/DataEmpty.tsx` wraps `ui/empty.tsx` with
  `border border-dashed bg-muted/30`. Used in 7 places. The dashed border reads
  as a placeholder/wireframe rather than a designed state.
- `composites/SkeletonKit.tsx` (148 lines) is a good, complete set —
  `DashboardPage`, `ProfilePage`, `MatchesPage`, `CalendarPage`,
  `PublicProfileGrid`, `ChatLayoutSkeleton`, etc. **These hard-code dimensions
  that mirror the current layouts** (`h-48`, `h-36`, `h-[440px]`, `h-[520px]`,
  `w-[340px]`), so any spacing change desynchronises the skeletons from the
  real content — a specific, easy-to-miss regression this plan must handle.
- `composites/AsyncBoundary.tsx` renders a bare centred `Spinner` with `py-12`
  when no `loadingFallback` is passed — and 6 of its 9 call sites pass nothing.
  So most async screens flash a lone spinner rather than a skeleton.
- Only `dashboard`, `matches`, `profile`, `profiles/[id]`, `calendar` and
  `(chat)` have `loading.tsx` files.

### 7. The ESLint enforcement, and a gap in it

`frontend/eslint.config.mjs`:

- Lines 33–52 — repo-wide over `src/**`: `no-restricted-syntax` bans string
  literals matching
  `\b(neutral|gray|slate|zinc)-(50|100|…|950)\b` and raw hex
  `^#([0-9a-fA-F]{3}|{6}|{8})$`. One exemption:
  `src/components/auth/GoogleAuthButton.tsx` (lines 53–59).
- Lines 60–82 — over **`src/app/**` and `src/features/**` only**: `className`
  attributes (both plain `Literal` and `TemplateLiteral` forms) may not contain
  `rounded-`, `shadow-`, `border` / `border-[trblxy]`, `h-[`/`w-[`/`p-[`,
  `text-[`, `gap-[`, `top-[`.
  **Two properties of this rule are easy to get wrong and both matter below.**
  (i) The selector is a *descendant* match, so it fires on literals inside
  `className={cn("…")}`, not just `className="…"`. (ii) The regex is anchored
  by `(?:^|\s)`, which makes it far narrower than it reads: `[hwp]-\[` matches a
  bare `h-[` / `w-[` / `p-[` but **not** `min-w-[220px]`, `max-h-[170px]` or
  `pt-[21px]`; and `border(?:$|-[trblxy]?$)` matches only `border` or `border-t`
  at **end of string**, so `border-border flex … border-b px-3` is clean.
- a11y rules are pinned to `error` for `alt-text`, `anchor-has-content`,
  `aria-role`; `warn` for `click-events-have-key-events` and
  `no-static-element-interactions` (lines 25–30).

**The gap: `frontend/src/features/` does not exist.** The layering rule
therefore applies only to `src/app/**`. Everything in
`src/components/{matches,profile,chat,calendar,inbox}/` — which is where the
product's real UI lives — is unpoliced, and it shows: `MatchCard.tsx:212`
hand-rolls `rounded-lg border` on a dropdown trigger, `ChatSidebar.tsx:53`
hard-codes `rounded-xl`, `ModuleAccordion.tsx:76` sets `rounded-[10px] border`.
All would be errors if those files lived under `src/app/`.

Two things *look* like violations but are not, and the distinction matters for
the inventories in steps 10/12/13: `Matches.tsx`'s `min-w-[220px]` /
`max-w-[450px]` and `ProfileView.tsx`'s `pt-[21px]` are all **clean** under the
rule as written, per property (ii) above. They are still bad — off-scale magic
numbers this plan removes on design grounds — but they are not lint debt, and
budgeting them as such would misstate what each glob commit requires.

This plan works *with* the rules (all new affordances land in composites) and
extends the rule's `files` glob to cover the feature component folders — but
**that is not free, and it is not merely "enforcing an existing convention."**
Violation counts per folder, measured under the real rule (descendant match
included): `matches` **4**, `profile` **2**, `chat` **15**, `inbox` **0**,
`calendar` **10**; `src/app/**` is already **0**, which is why
`pnpm --dir frontend lint` passes today. Extending the glob to a folder before
its violations are removed puts the repo in a red state, so the glob is added
**per folder, as the final commit of the step that cleans it** (step 10 →
`matches`, step 12 → `profile`, step 13 → `chat` + `inbox`).

`calendar` is the exception: no step in this plan restructures it (Out of scope
#8), so its 10 violations would remain. Step 15 therefore adds an **explicit
exemption override** for `src/components/calendar/**` rather than pretending the
folder is covered, and names the migration as follow-up work.

### 8. Existing tests

`frontend/vitest.config.ts` — jsdom, setup `./vitest.setup.ts` (which is just
`@testing-library/jest-dom/vitest`), include
`src/**/*.{test,spec}.{ts,tsx}`.

**There is exactly one frontend test: `frontend/src/utils/user.test.ts`** — a
pure utility test with no DOM. `@testing-library/react` is installed (and
listed in `knip.json`'s `ignoreDependencies`, i.e. currently unused).

Implication both ways: **no existing test can be broken by a restyle**, and
**there is no safety net**. This plan adds a small number of unit tests, only
for the new composites where a behavioural contract exists (teach-before-learn
ordering, variant→token mapping), so the acceptance criteria have real
commands behind them.

### 9. Measured contrast (baseline)

Computed by converting the `globals.css` oklch values to linear sRGB and
applying the WCAG relative-luminance formula:

| Pair | Ratio | Verdict |
|---|---|---|
| LIGHT `foreground` on `background` | 16.03 | pass |
| LIGHT `muted-foreground` on `background` | 5.86 | pass |
| LIGHT `muted-foreground` on `muted` | 5.52 | pass |
| LIGHT `primary-foreground` on `primary` | 8.57 | pass |
| **LIGHT teach badge fg on `accent-teach-soft`** | **2.90** | **FAIL** |
| **LIGHT learn badge fg on `accent-learn-soft`** | **2.63** | **FAIL** |
| **LIGHT `accent-learn` on `background`** | **2.94** | **FAIL** (<3:1 even for icons) |
| LIGHT `accent-teach` on `background` | 3.23 | icons only, fails as text |
| **LIGHT `success` on `background`** | **3.61** | **FAIL as text** (it *is* used as text) |
| **LIGHT `brand-accent` on `background`** | **2.00** | **FAIL** (used as `size-8` icon) |
| LIGHT `border` on `background` | 1.35 | decorative only |
| DARK `foreground` on `background` | 15.98 | pass |
| DARK `muted-foreground` on `background` | 7.43 | pass |
| DARK teach badge fg on teach-soft | 6.09 | pass |
| DARK learn badge fg on learn-soft | 7.07 | pass |
| DARK `primary` on `background` | 7.19 | pass |
| DARK `border` on `background` | 1.51 | decorative only |

**Dark mode is currently more accessible than light mode.** The teach/learn
pills — the app's signature element — fail AA in light mode at `text-xs` (12px).
`text-success` is used as body text in `components/chat/ChatThread.tsx:99` and
`composites/TaskChecklistLink.tsx:27` at 3.61:1.

`--border` at 1.35:1 / 1.51:1 is fine for decoration but means the
`outline` `Button` variant and `Input` (`border-input`, which aliases
`--border`) have no perceivable boundary — a WCAG 1.4.11 non-text-contrast
issue for form controls, and a contributor to the "flat" feel.

---

## Landability

**Every step below leaves the app fully renderable.** That is a hard constraint,
not a nicety: a redesign plan whose intermediate states are broken cannot be
reviewed, cannot be bisected, and forces an all-or-nothing merge. This plan is
structured so that value lands early and monotonically:

- **Steps 1–6 change tokens, primitives and layout components only.** Because
  every screen already consumes `Button`, `Input`, `Card` and `Badge`, the
  entire app visibly improves after step 4 without a single route file being
  touched. This is the payoff of A1's leverage argument.
- **Steps 7–13 adopt the new frame one screen at a time.** A screen not yet
  migrated still renders correctly — it just keeps its old bespoke spacing until
  its turn.
- **Step 15 is the sweep + guardrail.**

If the work has to stop early, stopping after step 6 still yields a
noticeably better app; stopping after step 9 yields a coherent one.

### Verification setup (do this once, before step 1)

Every step's `> Verify:` block ends with a browser gate run through the
`e2e-check` skill. That skill needs a live stack and an authenticated session.
Establish both once; the browser context then carries the auth cookies across
all 15 steps.

1. **Dependencies.** Start Docker Desktop, then `docker compose up -d` from the
   repo root (Postgres + Redis only — it does not start the app services).
   On Windows, poll `docker info` until it succeeds before continuing.
2. **Schema.** `pnpm --dir backend exec prisma migrate dev`. **A fresh
   `docker compose up -d` gives an empty Postgres volume with no schema at
   all** — skipping this makes every subsequent item fail.
3. **Seed data.** `pnpm --dir backend exec prisma db seed`. Without it the
   `Skill` table is empty (so `SkillPicker`'s suggestion lookup via
   `SkillsService.getSkills` returns nothing — signup still works, since the
   picker accepts free-typed skills, but with none of the intended affordance)
   and, more importantly, **there are no other users**, so
   `getAvailableMatches` returns an empty list and `/discover` renders
   `DataEmpty` (`DiscoverPageContent.tsx:37–44`). Since `/discover` is in the
   fixed smoke set for every token step, skipping the seed means steps 1–6 are
   gated on a screenshot of an empty state.
4. **Backend env.** `backend/.env` must satisfy the Joi schema in
   `backend/src/config/env.validation.ts` or the app will not boot. **Set
   `REDIS_HOST=localhost` explicitly** — `env.validation.ts:18` marks it
   `optional().allow('')`, so the backend boots happily without it and silently
   degrades to in-memory single-instance mode with BullMQ disabled. That kills
   the repeatable maintenance jobs registered in `QueueBootstrapService`
   (`repeat: { every: 30_000 }`), including auto-accept — which is what turns a
   friend request into a usable chat in item 7.
5. **Backend.** `pnpm --dir backend start:dev` (:5200).
   `backend/.claude/skills/run-backend` automates items 1–5 and includes a
   `smoke.sh` that exercises signup → cookie auth → protected route.
6. **Frontend.** `pnpm --dir frontend dev` (:3000). Wait for the Turbopack
   "Ready" line before firing any browser action.
7. **Authenticate.** Drive the real signup flow at `/auth/signup` in the
   browser. **Do not look for a seeded account** — `backend/prisma/seed.ts:234`
   sets `password: 'bot_account_no_login'` as a literal string on `isBot: true`
   users with random faker emails, so no seeded user can log in. Signup
   *requires* at least one skill in each list (`validation/signUp.ts:20–21`,
   `.min(1)` on both `knownSkills` and `skillsToLearn`) — which is also what you
   want, since otherwise `/dashboard` renders the onboarding wizard branch
   (`dashboard/page.tsx:53`) instead of the normal layout and most of what these
   steps change is off screen. Pick skills that overlap the seeded set so
   `/discover` has matches.
8. **Create a real chat.** From `/discover`, add a seeded bot as a friend and
   wait ≤30s for the auto-accept repeatable to fire, then open the resulting
   thread. **Do this before step 6**, whose two named assertions
   (`/inbox/<chatId>` has exactly one vertical scrollbar; the composer is
   visible without scrolling) have nothing to run against otherwise. Send a
   couple of messages so `ChatMessageList` has grouped content and a date
   separator to check in step 13.
9. **Keep one browser context for the session.** Re-driving signup per step is
   wasted effort; the httpOnly `access_token` / `refresh_token` cookies persist.

**Stop condition when the stack is unavailable.** "Partially verified" is a
label, not a licence — a gate every step can opt out of is not a gate. So:

- **These steps MAY be marked done on lint/tsc/grep evidence alone**, because
  their acceptance criteria are mechanical rather than visual: **step 7**
  (`SwapAxis` is unconsumed; its contract is covered by vitest) and the
  **glob-commit halves of steps 10, 12 and 13** (making the glob change and
  getting `lint` → 0 errors *is* the proof — the rule certifies itself).
- **These steps MUST NOT be marked done without the browser gate**, because the
  browser *is* the only evidence for what they change: **steps 1–6** (every
  acceptance criterion is a rendered result — surface ladder, type scale,
  control heights, card planes, page rhythm, and step 6's scrollbar/composer
  assertions), **step 8** (dashboard), **step 9** (the long-name and overflow
  edge cases), **the design halves of steps 10 and 13** (adopting
  `PageHeader`/`PageBody` in `Matches.tsx`, and the whole chat-surface rebuild —
  the two largest screen rewrites in the plan; only their *glob* halves are
  lint-closable), **step 11** (the 390px `grid-cols-3` breakpoint), **the design
  half of step 12** (A15's teal/orange assertion is explicitly a screenshot
  check), **step 14** (skeleton-vs-loaded heights within ~8px cannot be grepped,
  and `/schedule` gains a page frame) and **step 15** (the full matrix plus
  keyboard traversal).

Steps 10, 12 and 13 therefore appear in **both** lists, split by half. No step
is unclassified.
- If the stack cannot be brought up, **stop and report the blocker** rather than
  proceeding through the must-not list on partial evidence. Falling back to
  `(auth)` routes and unauthenticated states only is acceptable for keeping
  momentum on lint/tsc work, but the affected steps stay **open**, not done.

---

## Implementation steps

Run all commands from the repo root unless noted. Complete "Verification setup"
above before step 1.

**"Browser gate" means**: drive the named routes through the `e2e-check` skill
(`frontend/.claude/skills/e2e-check/SKILL.md`) via the `playwright` MCP server,
in **both** themes (toggle via the `ThemeToggle` in the header,
`components/ui/theme-toggle.tsx`), at the named viewports, capturing a
screenshot per route/theme and confirming the console has no new errors and the
network no unexpected 4xx/5xx. The **smoke set** is `/dashboard`, `/discover`,
`/inbox` — the three routes with the widest token exposure. Per A27, token steps
(1–6) run the smoke set at 1280px and 390px; screen steps (7–14) run it at
1280px plus their own routes at both widths, plus the named edge case.

---

**1. Add a re-runnable contrast checker and fix the failing light-mode tokens.**
`[x]` **Status: PARTIALLY VERIFIED.** `check:contrast` (44/44 pairs, gate
proven to fail on revert), `lint` (0 errors, 9 warnings ≤ 10 baseline), and
`knip` (clean) all pass. The browser gate did **not** run: Docker Desktop's
backend was stuck on a stale `AF_UNIX` socket
(`%LOCALAPPDATA%\Docker\run\dockerInference`, "The file cannot be accessed by
the system") that survived killing every Docker process and had no running
WSL distro holding it — likely needs a host reboot to clear. Per user
direction, this step (and the plan generally) proceeds on mechanical evidence
only until Docker is available again; re-run the smoke-set browser gate for
this step once it is.
Also fixed, beyond the step's named token list, because the checked-in pair
table requires them and no other step owns them: `--brand-accent` (was
2.00:1/2.03:1 light against background/card, non-text 3:1 requirement — step
8's plan to move the dashboard icon to "a token that passes 3:1" only works
around one usage, it never fixes the shared token itself) and dark
`--session-amber-fg`/`--session-amber-bg` (was 4.48:1, just under the 4.5:1
text requirement, not listed in Current State §9's dark table). Both fixed by
darkening/lightening in place; see commit for exact values.

Files: new `frontend/scripts/check-contrast.mjs`; edit
`frontend/src/styles/globals.css`.

The script parses the oklch values out of `globals.css` (`:root` and `.dark`),
converts oklch → linear sRGB → WCAG relative luminance, and asserts a checked-in
pair table, exiting non-zero on failure. Model it on
`frontend/scripts/extract-shadcn.mjs`, the existing precedent for a `scripts/`
node utility. Add it as a `check:contrast` script in `frontend/package.json`.

**`globals.css` is not a flat list of literals, and a naive parser will exit 0
while proving nothing.** The script must therefore:

- **Resolve `var()` chains.** `--card: var(--surface)` (119),
  `--popover: var(--surface)` (121), `--input: var(--border)` (139 and 212),
  `--secondary-foreground`/`--accent-foreground`/`--card-foreground` →
  `var(--foreground)`, and the eight `--sidebar-*` aliases (165–172) all need
  chain resolution before conversion.
- **Composite alpha over a named backdrop.** The twelve `--session-*-bg` values
  (173–184, 217–228) carry alpha — e.g. `oklch(0.42 0.12 285 / 18%)`. Each pair
  entry must name the backdrop token to composite over (`--card` for the
  calendar chips) rather than letting the script guess.
- **Exit non-zero on any token it cannot resolve**, never skip it. A silent
  skip is the failure mode that makes this gate worthless.
- Assert against **4.5:1 for text** pairs and **3:1 for non-text** pairs, with
  each row tagged as one or the other.

**Pair table to check in** — the 18 rows measured in Current state §9, each in
both themes, plus these non-text rows required by A18: `--ring` on
`--background`, `--ring` on `--card`, `--input` on `--background`, `--input` on
`--card`, `--brand-accent` on `--background`, `--brand-accent` on `--card`,
`--accent-teach` on `--card`, `--accent-learn` on `--card`, and each
`--session-*-fg` on its composited `--session-*-bg`. Text rows must include
`--success` on both `--background` and `--card`, since it is used as text at
`chat/ChatThread.tsx:99` and `composites/TaskChecklistLink.tsx:27`.

`extract-shadcn.mjs` currently trips `no-console` as a warning, and the new
script would too — but A21 forbids increasing the warning count. Add an ESLint
override disabling `no-console` for `frontend/scripts/**`, and add the script
to `knip.json`'s frontend `entry` array so A25 holds.

**Token edits in this step.** In `:root` only: lower the lightness of
`--accent-teach` and `--accent-learn` (they are the *foreground* of the soft
chips, currently 2.90:1 / 2.63:1) and `--success` (3.61:1 as text).

In **both** `:root` **and** `.dark`: give `--input` a distinct value so it stops
aliasing `--border` (`globals.css:139` and `:212`). Dark `--border` measures
1.51:1 against `--background` — the same WCAG 1.4.11 failure as light's 1.35:1 —
so fixing only `:root` would leave A18 unsatisfiable forever. This does **not**
reopen the dark-mode regression risk: `--input` is a non-text border token and
touches none of the text pairs dark currently passes (teach 6.09, learn 7.07,
primary 7.19, muted-foreground 7.43).

Otherwise leave `.dark` alone in this step — specifically, do not mirror the
`--accent-teach` / `--accent-learn` / `--success` darkening into it. Dark
already passes those, and mirroring "for symmetry" would regress it.

> Verify: `pnpm --dir frontend exec node scripts/check-contrast.mjs` exits 0
> (and exits **non-zero** if you temporarily revert one token — prove the gate
> actually fails before trusting it) · `pnpm --dir frontend lint` (0 errors,
> warnings still ≤ 10) · `pnpm knip` · **browser gate:** `e2e-check` over the
> smoke set `/dashboard`, `/discover`, `/inbox` at 1280px and 390px in both
> themes; teach/learn pills must still read as teal/orange, just deeper, and
> form-control borders must now be visible against the card surface.

---

**2. Build the surface ladder and wire the dead tokens.**
`[x]` **Status: PARTIALLY VERIFIED.** `check:contrast` (44/44), `lint` (0
errors, 9 warnings), `knip` (clean), `tsc --noEmit` (clean) all pass. Browser
gate not run — Docker still unavailable (see step 1's status note).

File: `frontend/src/styles/globals.css`.

Split `--muted`, `--secondary`, `--accent` into three distinct values per theme
(currently identical — lines 125–130 and 198–202). Suggested relationship, not
literal values: in light, `--secondary` slightly warmer/darker than `--muted`,
`--accent` a touch more chromatic; in dark, three ascending lightness steps from
`--background`. Rebalance `--surface` / `--surface-raised` so the elevation
ladder in step 4 has room. Delete `--radius-3xl`/`--radius-4xl` if unused after
checking `rounded-3xl`/`rounded-4xl` usage (`rounded-4xl` is used once, in
`badge.tsx:8`).

> Verify: `pnpm --dir frontend exec node scripts/check-contrast.mjs` exits 0 ·
> `pnpm --dir frontend lint` · **browser gate:** `e2e-check` over the smoke set
> plus `/schedule` (the `--session-*` calendar chips are the pairs most likely
> to be disturbed by moving `--muted`/`--surface`), 1280px and 390px, both
> themes — hover states, `bg-muted` chips and card surfaces must now be
> distinguishable from each other.

---

**3. Extend the type scale to 6 steps and configure the fonts properly.**

Files: `frontend/src/styles/globals.css` (`@theme inline`, lines 46–56);
`frontend/src/app/layout.tsx` (lines 12–20).

Add `--text-h3`, `--text-body` (16px), `--text-body-sm` (14px) with matching
`--line-height` / `--letter-spacing` / `--font-weight` companions. Set the
`@layer base` `body` rule to the body step so 16px becomes the default rather
than something each screen opts into. Configure `Fraunces` with an explicit
`weight` range and `axes` (at minimum `SOFT`, `WONK`) and `Inter` with the
weights actually used, so `font-heading` has real character.

Expect this step to visibly reflow text everywhere — that is the intent, and
it is why it lands before any screen work.

> Verify: `pnpm --dir frontend exec tsc --noEmit` ·
> `pnpm --dir frontend lint` · **browser gate:** `e2e-check` over the smoke set
> plus `/auth/login` (the one surface already using `text-display`), both
> themes, both widths; confirm via the captured screenshots that headings render
> in Fraunces and body in Inter at 16px, and check the network panel for the
> Fraunces payload size (see the CLS/perf risk below).

---

**4. Re-scale the control primitives.**

Files: `frontend/src/components/ui/{button,input,textarea,badge,item,field}.tsx`.

Raise `Button` `default`/`lg`/`icon` and `Input`/`Textarea` to ≥40px (with ≥44px
effective hit area), `Badge` to ≥24px. **Keep** `sm`, `xs`, `icon-sm`,
`icon-xs` — they are legitimately needed by the chat retry button
(`ChatMessageList.tsx`) and header toolbar. Widen horizontal padding to match.
Strengthen the focus ring so it reaches 3:1 against both `--background` and
`--card` (A18).

**Also move the primitives off their hard-coded type sizes** (A9): `button.tsx:8`
carries `text-sm` and `badge.tsx:8` carries `text-xs` in their CVA *base*
classes, which override the `@layer base` body rule set in step 3. Base classes
move to the new `body` / `body-sm` steps; the `sm`/`xs` size variants may keep a
smaller step deliberately, since that is their purpose.

Note `input.tsx:12` already sets `text-base md:text-sm` — the `md:` override
exists to stop iOS Safari zooming on focus at <16px. Keep that guard working:
if the body step is 16px, the `md:text-sm` override should simply be dropped
rather than re-pointed at a 14px step.

Do **not** widen the chat composer here. `ChatComposer.tsx` sets
`min-h-10` on its `Textarea` and `size-10` on the send `Button`; those interact
with the viewport-locked chat pane and are handled in step 6.

Do **not** add new shadcn primitives here. If a later step genuinely needs one,
follow `.claude/skills/add-shadcn-component/SKILL.md` — use the connected
`shadcn` MCP server's list/add tools, then immediately conform the output to the
two ESLint rules (the registry ships `neutral-*` literals that are errors in
this repo) and export any wrapper through the composites barrel.

> Verify: `pnpm --dir frontend exec tsc --noEmit` · `pnpm --dir frontend lint` ·
> `grep -nE '\btext-(sm|xs)\b' frontend/src/components/ui/{button,badge}.tsx`
> shows no hit in the base `cva()` argument · **browser gate:** `e2e-check` over
> the smoke set plus `/profile/edit` (forms), both themes, both widths; use the
> browser to assert computed heights — a primary `Button` and an `Input` must
> both be ≥40px. Edge case: submit the edit-profile form with an invalid field
> and confirm the `aria-invalid` ring still reads at the new size.

---

**5. Re-scale the card and elevation system.**

Files: `frontend/src/components/ui/card.tsx`;
`frontend/src/styles/globals.css` (`--elev-shadow-*`).

Set `--card-spacing` default to `--spacing(6)` (24px), `sm` to `--spacing(4)`.
Rework the three `cardVariants` elevations per the design direction: `flat` =
`--surface` + hairline, `raised` = `--surface-raised` + `--shadow-sm`,
`interactive` = `raised` + the existing hover lift (keep the
`transition-[transform,box-shadow] duration-[var(--duration-fast)]` and
`hover:-translate-y-0.5`, `card.tsx:11–14`). Raise the light-mode shadow alphas
enough to be perceptible on a `0.99`-lightness background.

**Also replace `text-sm` in the `cardVariants` base class** (`card.tsx:7`,
`text-sm text-card-foreground`) with the new body step. This is the single
highest-impact line for A9: nearly every `(main)` surface — the dashboard hero,
`MatchCard`, `ProfileView`'s three cards, `ChatThread` — renders inside a
`Card`, so until this changes, step 3's type scale does not reach card
interiors and the claim that the app improves by step 6 without touching routes
is overstated.

**A8 baseline.** The step-5-scope count is **73** (both matching lines and
matching occurrences — they coincide here). This is *not* the 191 figure quoted
in Current state §2; that one covers all of `frontend/src` including
`components/ui/**`, where tight gaps are correct for icon/label pairs and are
deliberately left alone. A8's "≥50% reduction" is measured against **73 → ≤36**:

```
grep -roE '\b(gap|space-y|space-x)-(1|1\.5|2|2\.5|3)\b' \
  frontend/src/app frontend/src/components/matches \
  frontend/src/components/profile frontend/src/components/chat \
  frontend/src/components/inbox --include=*.tsx | wc -l
```

Use `-roE` (occurrences), not `-rnE` (lines) — a single `className` can carry
two matches. Record the number in the commit message; step 15 re-runs it.

> Verify: `pnpm --dir frontend lint` ·
> `grep -n 'text-sm' frontend/src/components/ui/card.tsx` returns nothing in the
> base `cva()` argument · `grep -n 'card-spacing' frontend/src/components/ui/card.tsx`
> shows `--spacing(6)` (A6) · **browser gate:** `e2e-check` over the smoke set
> plus `/schedule`, both themes, both widths — cards must read as distinct
> planes and the three elevations must be distinguishable side by side. **Two
> computed-style assertions, not eyeball judgements:** card body copy measures
> 16px, and a default `Card`'s resolved padding measures 24px.

---

**6. Make the page frame real — and re-derive the viewport-locked heights it
breaks: `Container`, `AppShellMain`, `PageBody`, `PageSection`, `PageHeader`,
`--header-h`, chat pane heights.**

Files: `frontend/src/components/layout/Container.tsx`;
`frontend/src/components/layouts/{AppShell,PageBody,PageHeader}.tsx`;
`frontend/src/styles/globals.css` (add `--space-page`, `--space-section`,
`--space-stack`; fix `--header-h`);
`frontend/src/app/(main)/(chat)/layout.tsx`;
`frontend/src/components/chat/ChatThread.tsx`;
`frontend/src/components/chat/ChatComposer.tsx`.

- `Container`: derive from `--content-max` and `--page-gutter` (A13), and raise
  the gutter at `md+` via the token rather than a hard-coded `md:px-6`.
- `AppShellMain`: replace `py-2 sm:py-6 md:py-8` with `--space-page` — 8px of
  top padding on mobile is the single worst "cramped" value in the codebase.
- `PageBody`: `gap-8` → `--space-section` (2.5rem at `md+`).
- `PageSection`: `gap-4` → `--space-stack`; render its title through the new
  `h2` step instead of the raw `text-h2`.
- `PageHeader`: give it the new `h1` + `body` steps, an optional `illustration`
  slot, and enough breathing room to be worth adopting. Currently `gap-1`
  between eyebrow/title/description (`PageHeader.tsx:25`) — too tight for its
  role.

**Fix the viewport-locked chat heights in this step, not step 13.** `AppShell`
is a `grid h-dvh overflow-hidden` shell with `<main>` at `overflow-y-auto`
(`AppShell.tsx:39`, `51–54`). Inside it, `(chat)/layout.tsx:37` hard-codes
`min-h-[min(75dvh,800px)]` and `ChatThread.tsx:73` hard-codes
`min-h-[min(70dvh,720px)]` — **neither subtracts the header, footer or
`AppShellMain` padding.** Raising that padding here, and the composer controls
in step 4, pushes the pane past the viewport and produces nested scrollbars. So
re-derive both as `calc(100dvh - var(--header-h) - …)` in the same commit that
changes the padding. Otherwise `/inbox/<chatId>` ships degraded for nine steps.

**Correct `--header-h` while you are here.** It is `3.5rem` (56px,
`globals.css:141`) but the header's tallest child is `AvatarMenu`'s
`UserAvatar size="md"` = `size-12` (48px) inside `Header.tsx`'s `py-3`, so the
real header is ~72px. `ComingSessionWarning.tsx:64` already positions itself
with `fixed top-(--header-h)` and is therefore already misaligned; step 4's
taller controls widen the gap. Either measure and correct the token, or drive
it from the element — but do not leave it stale, because the chat `calc()`
above now depends on it being true.

> Verify: `pnpm --dir frontend exec tsc --noEmit` · `pnpm --dir frontend lint` ·
> **browser gate:** `e2e-check` over every `(main)` route (`/dashboard`,
> `/discover`, `/learning`, `/schedule`, `/profile`, `/inbox`,
> `/inbox/<chatId>`) at 1280px and 390px in both themes. Two specific
> assertions: (i) `/inbox/<chatId>` has **exactly one** vertical scrollbar and
> the composer is visible without scrolling; (ii) trigger
> `ComingSessionWarning` (an account with a session starting soon) and confirm
> it aligns to the real header edge. Only `/dashboard` will change much
> otherwise — expected, the rest adopt in steps 8–13.

---

**7. Add the `SwapAxis` composite and fix the teach/learn semantics.**

Files: new `frontend/src/components/composites/SwapAxis.tsx` and
`SwapAxis.test.tsx`; edit `frontend/src/components/composites/SkillPill.tsx` and
`frontend/src/components/composites/index.ts`.

`SwapAxis` takes `{ teach: {title}[], learn: {title}[], ... }` and renders the
teal teach column, the `↔` connector, and the warm learn column, with the fixed
icon pairing. It owns all radius/border/shadow so route code stays legal under
the ESLint layering rule. Add the `--ease-spring` / `--duration-slower`
connector transition here (satisfying A3), and add its keyframe to the
`prefers-reduced-motion` block in `globals.css` (A20).

While in `SkillPill.tsx`: `SkillPill` (the single-pill export) currently has
zero consumers — either use it inside `SwapAxis` or drop it from the barrel so
`pnpm knip` stays meaningful.

The test asserts: teach renders before learn in DOM order; `variant="learn"`
maps to the learn token class and not the teach one; overflow `+N` still
renders past `max`.

**Enforcement note for steps 8–13.** The layering rule does not yet cover the
feature folders (Current state §7). To see what a folder owes before you start,
**temporarily** add it to the `files` glob in `eslint.config.mjs:61–64` and run
`pnpm --dir frontend lint`, then revert. Do not use a grep as a proxy — two
things make hand-rolled patterns wrong in both directions:

- The selector is `JSXAttribute[name.name='className'] Literal[…]`, a
  **descendant** match, so it also fires on literals inside
  `className={cn("…")}`. A `className="` anchor misses those — 8 of the 21
  real violations across these folders are of this form.
- The regex is **narrower than it looks**. `[hwp]-\[` is anchored by
  `(?:^|\s)`, so it matches a bare `h-[` / `w-[` / `p-[` but **not**
  `min-w-[220px]`, `max-h-[170px]` or `pt-[21px]`. And
  `border(?:$|-[trblxy]?$)` only matches `border` or `border-t` at
  **end of string**, so `border-border flex … border-b px-3` is clean.

Verified counts under the actual rule: **`matches` 4, `profile` 2, `chat` 15,
`inbox` 0, `calendar` 10** — and `src/app/**` is already 0, which is why
`pnpm --dir frontend lint` passes today.

> Verify:
> `pnpm --dir frontend exec vitest run src/components/composites/SwapAxis.test.tsx`
> · `pnpm --dir frontend lint` · `pnpm --dir frontend exec tsc --noEmit` ·
> **browser gate:** `e2e-check` over the smoke set at 1280px, both themes.
> `SwapAxis` has no consumer yet, so this step is a no-visual-change guard —
> confirm nothing regressed and the console is clean.

---

**8. Rebuild the dashboard.**

File: `frontend/src/app/(main)/dashboard/page.tsx`; new
`frontend/src/components/composites/QuickLinkTile.tsx` (+ barrel export).

Replace the hand-rolled hero `Card` (lines 73–119) with `PageHeader` plus a
`SectionPanel` for the completeness checklist. Move the locally-defined
`QuickLink` (lines 266–285) into a `QuickLinkTile` composite. Widen the
`gap-3` grids (lines 231, 255) to the stack rhythm. Drop `text-sm` body copy in
favour of the default body step. Replace the failing `text-brand-accent` icon
treatment (line 279) with a token that passes 3:1.

> Verify: `pnpm --dir frontend lint` · `pnpm --dir frontend exec tsc --noEmit` ·
> **browser gate:** `e2e-check` — smoke set at 1280px, plus `/dashboard` at
> 1280px and 390px in both themes. Edge case: a second account with zero skills,
> to exercise the `needsOnboarding` branch (`dashboard/page.tsx:53`) and the
> `DataEmpty` states for matches and sessions.

---

**9. Rebuild `MatchCard` around `SwapAxis`.**

File: `frontend/src/components/matches/MatchCard.tsx`.

Replace the two stacked label blocks (lines 180–191) with `SwapAxis`. Replace
the hand-rolled `size-7` dropdown trigger (lines 210–213) with `Button`
`variant="outline" size="icon"` so it inherits the new touch target and focus
ring. Rework the `MetricRing` from `absolute top-4 right-4` + `pr-12`
(lines 148, 170) into a grid cell so it can't collide with long names.

> Verify: `pnpm --dir frontend lint` · `pnpm --dir frontend exec tsc --noEmit` ·
> **browser gate:** `e2e-check` — smoke set at 1280px, plus `/discover` and
> `/learning` at both widths and both themes. Edge case: a partner with a very
> long name (tests the removed `MetricRing`/`pr-12` collision) and one with 6+
> skills (the `SkillPillList` overflow `+N` path).

---

**10. Adopt the page frame in Discover / Learning, and clear the `matches`
folder for its glob commit.**

Files: `frontend/src/components/matches/Matches.tsx`;
`frontend/src/components/matches/ModuleAccordion.tsx`.

Replace the inline `<h1>` + description block (lines 162–222) with `PageHeader`
+ `PageBody`. Replace `gap-7.5` (line 146) and the arbitrary `min-w-[220px]` /
`min-w-[240px]` / `min-w-[200px]` / `max-w-[450px]` values (181, 199, 205, 223)
with scale values or a composite. Move the "Generating your AI training plan"
banner (lines 147–160) into a `SectionPanel` or a small `NoticeBanner`
composite rather than a bespoke `Card` with `border-primary/30 bg-primary/5`.

**`ModuleAccordion.tsx` is in this step, not step 11.** It carries 2 violations
(76, 137) and step 11 runs *after* this step's glob commit, so leaving it there
lands 2 lint errors. This is a **mechanical lift only** — move the offending
`className` values into a composite or an existing primitive. It is not an
invitation to redesign the module accordion; its visual rework, if any, belongs
to step 11.

**Close the enforcement gap for this folder, as the last commit of this step.**
Add `src/components/matches/**` to the layering rule's `files` glob in
`eslint.config.mjs:61–64`. The glob commit requires the **whole folder** clean,
not just the files this step redesigns. Full inventory (**4** total):

| File | Count | Lines | Cleared by |
|---|---|---|---|
| `MatchCard.tsx` | 2 | 126 (`rounded-full`), 212 (`rounded-lg` inside `cn()`) | step 9 |
| `ModuleAccordion.tsx` | 2 | 76 (`rounded-[10px]`), 137 (`gap-[7px]`) | this step (mechanical) |
| `Matches.tsx` | **0** | — | — |

**`Matches.tsx` has zero violations**, despite being this step's main design
target. Its `min-w-[220px]` / `max-w-[450px]` values are *not* rule violations —
see the note under step 7 — though this step still replaces them, because
off-scale magic numbers are a design problem whether or not ESLint objects.

> Verify: **make the `eslint.config.mjs` glob change first, then run
> `pnpm --dir frontend lint` — 0 errors.** Do not use a grep proxy: the rule's
> selector is a *descendant* match, so it also fires on literals inside
> `className={cn(…)}` (e.g. `MatchCard.tsx:212`), which a `className="` grep
> cannot see. Letting the rule certify itself is both simpler and correct. ·
> `pnpm --dir frontend exec tsc --noEmit` · **browser gate:** `e2e-check` —
> smoke set at 1280px, plus `/discover`, `/learning` and `/discover?skill=react`
> (filter path) at both widths and both themes. Edge case: the empty state
> (`DataEmpty` + `InlineSkillPicker`) on an account with no available matches.

---

**11. Rebuild the match/plan detail screen.**

File: `frontend/src/app/(main)/matches/[id]/page.tsx`.

`ModuleAccordion.tsx` was cleared of layering violations in step 10 and
`components/matches/**` is now under the ESLint glob, so any change to it here
must keep radius/border/shadow in a composite. Touching it at all is optional in
this step — its 4 violations are already gone.

Normalise the four ad-hoc heading treatments (lines 116, 124, 143, 182, 205)
onto the `h1`/`h2`/`h3` steps. Wrap in `PageBody` + `PageHeader` +
`PageSection`. Give the `grid gap-8 grid-cols-3` (line 113) an explicit mobile
breakpoint. Fix `<ol className="list-disc">` → `<ul>` (line 125) and drop the
trailing-colon label `"Benefits:"` (124).

> Verify: `pnpm --dir frontend lint` · `pnpm --dir frontend exec tsc --noEmit` ·
> **browser gate:** `e2e-check` — smoke set at 1280px, plus `/matches/<id>` at
> both widths and both themes for a plan with modules. Edge case: the loading
> dialog state (lines 104–111) — throttle the network to catch it, and confirm
> the 390px layout no longer relies on the unbreakpointed `grid-cols-3`.
> Generating a plan requires the backend's `ai` BullMQ queue and a working
> `OPENAI_API_KEY`; if that is unavailable, use an account whose plan already
> exists rather than skipping the route.

---

**12. Rebuild the profile screens.**

Files: `frontend/src/components/profile/ProfileView.tsx`;
`frontend/src/components/profile/Profile.tsx`;
`frontend/src/components/profile/EditProfile.tsx` (one-line lift only);
`frontend/src/app/(main)/profiles/[id]/page.tsx`.
`AddSkills.tsx` is **not** in scope — it has no violations under the real rule.

- **Fix the metaphor bug**: `ProfileView.tsx:28` — "Skills I Want to Learn" must
  use the learn treatment. Replace both cards with `SwapAxis` (A15).
- Remove `pt-[21px]` (35, 49), the `text-3xl`/`text-2xl leading-6` headings
  (37, 51, 78), the flex/grid hybrid (69), and the duplicated mobile/desktop
  skills blocks (102–109).
- Drop the `"Bio:"` / `"Actions:"` colon labels (90, 96).
- In `Profile.tsx`, the `min-w-[260px]` AI-suggestions button (line 146) and the
  hand-rolled suggestion rows (159–177) become a composite or use `UserRow`.
- **`EditProfile.tsx:157` is a mechanical lift only** — a single `rounded-full`
  avatar wrapper. The file has no design task in this plan; it is in scope
  solely because the folder's glob commit needs the whole folder clean. Move
  that one `className` value into a composite or an existing primitive and stop.
  **Do not redesign it** — it is 293 lines and rewriting it is not budgeted.

**Close the enforcement gap for this folder, as the last commit of this step:**
add `src/components/profile/**` to the `eslint.config.mjs` glob. The glob commit
requires the **whole folder** clean. Full inventory (**2** total):

| File | Count | Lines | Nature of work |
|---|---|---|---|
| `Profile.tsx` | 1 | 164 (`rounded-full`) | redesign (this step) |
| `EditProfile.tsx` | 1 | 157 (`rounded-full`) | mechanical lift |
| `ProfileView.tsx` | **0** | — | redesign, but no lint debt |
| `AddSkills.tsx` | **0** | — | untouched |

Two notes, because the intuition here is wrong in both directions.
`ProfileView.tsx` — the file carrying the A15 metaphor bug and the bulk of this
step's design work — has **zero** layering violations. And `AddSkills.tsx` also
has zero: its `max-h-[170px]` is not a rule violation (`[hwp]-\[` requires a
bare `h-[`, not `max-h-[`), so it is **out of this step entirely**, contrary to
an earlier draft that listed it as a mechanical lift. Lint debt and design work
do not coincide in this folder.

> Verify: **make the `eslint.config.mjs` glob change first, then run
> `pnpm --dir frontend lint` — 0 errors** (the rule certifies itself; no grep
> proxy, per step 10) · `pnpm --dir frontend exec tsc --noEmit` ·
> **browser gate:** `e2e-check` — smoke set at 1280px, plus `/profile`,
> `/profile/edit` and `/profiles/<id>` at both widths and both themes. **The A15
> assertion is visual and must be in the screenshot:** the "Skills I Know"
> column renders teal and "Skills I Want to Learn" renders orange. Edge case: an
> account with no bio and zero skills.

---

**13. Rebuild the chat / inbox surfaces.**

Files: `frontend/src/app/(main)/(chat)/layout.tsx`;
`frontend/src/app/(main)/(chat)/inbox/page.tsx`;
`frontend/src/components/chat/{ChatThread,ChatMessageList,ChatSidebar,ChatComposer,ChatsEmptyLanding}.tsx`;
`frontend/src/components/inbox/InboxRequestsPanel.tsx`;
`frontend/src/components/layouts/{SplitPane,DetailPane}.tsx` (deleted — see
below); `frontend/src/components/layouts/index.ts`;
`frontend/src/styles/globals.css`; `knip.json`.

**`SplitPane` and `DetailPane` are deleted, not adopted.** The previous draft
left this as a fork; it is now decided, because the adopt branch is actively
harmful: `layouts/SplitPane.tsx:26` hard-codes
`min-h-[min(75dvh,800px)]` — **byte-identical to the `(chat)/layout.tsx:37`
value step 6 replaces with a `calc()`**. Adopting it here would silently revert
step 6's fix and restore the nested scrollbar this plan exists to remove, while
also making a resizable drag handle the primary chat layout, which no
requirement asks for. So: delete both files, drop their exports from
`layouts/index.ts`, and remove the `knip.json` `ignoreIssues` entry for
`frontend/src/components/layouts/**`. Keep the hand-rolled flex in
`(chat)/layout.tsx` with step 6's `calc()` heights.

**Consequence for A3 — and this step owns the edit, not just the check.**
Deleting `SplitPane` removes `--pane-min`'s only plausible consumer, so
**delete the `--pane-min` declaration from `globals.css:146` in this same
commit.** A3 is amended to require the deletion rather than a wiring-up: an
unused token is exactly the dead weight A3 exists to remove. Step 15 only
*verifies* the deletion; if it is not done here, nothing else does it.

Loosen message-group rhythm (`ChatMessageList` `gap-3`/`gap-1`), and give the
date separator chip the new badge scale.

The pane heights and `--header-h` were already re-derived in step 6, so this
step does not re-open the `calc()` work.

**Close the enforcement gap for these folders, as the last commit of this
step:** add `src/components/chat/**` and `src/components/inbox/**` to the
`eslint.config.mjs` glob. Full inventory (**15** total, all in `chat`):

| File | Count | Lines | Nature of work |
|---|---|---|---|
| `chat/ChatSidebar.tsx` | 7 | 53, 78, 88, 108, 148, 163, 195 | redesign (this step) |
| `chat/ChatThread.tsx` | 4 | 73, 74, 78, 108 | redesign (this step) |
| `chat/ChatMessageList.tsx` | 2 | 33, 108 | redesign (this step) |
| `chat/ChatComposer.tsx` | 1 | 20 (`border-t`) | mechanical lift |
| `chat/ChatsEmptyLanding.tsx` | 1 | 48 | mechanical lift |
| `inbox/InboxRequestsPanel.tsx` | **0** | — | untouched |

`ChatComposer.tsx` and `ChatsEmptyLanding.tsx` were absent from an earlier
draft's file list and would have landed 2 lint errors on the glob commit.
`ChatComposer.tsx` is also touched in step 6, but only for its control heights —
line 20 is a separate `border-t` literal that step 6 has no reason to visit, so
it is cleared here. Four of `ChatSidebar`'s and one of `ChatMessageList`'s
violations (53, 148, 163, 33) live **inside `cn()`** and are invisible to a
`className="` grep — another reason the verify step runs the rule itself.

`components/inbox/` is **already clean**, so its glob entry is free — add it
anyway so the folder cannot regress. Note
`app/(main)/(chat)/inbox/page.tsx` (a route file, already under the glob) is a
different file from `components/inbox/InboxRequestsPanel.tsx`.

Also note `app/(main)/(chat)/inbox/[id]/page.tsx` is a bare re-export of
`(chat)/chats/[id]/page.tsx` — so `/inbox/<chatId>` and `/chats/<chatId>` render
the same component, and this step owns it. There is no separate `/chats/[id]`
screen to migrate.

> Verify: **make the `eslint.config.mjs` glob change first, then run
> `pnpm --dir frontend lint` — 0 errors** (the rule certifies itself; no grep
> proxy, per step 10) ·
> `grep -n 'pane-min' frontend/src/styles/globals.css` returns nothing ·
> `pnpm --dir frontend exec tsc --noEmit` · `pnpm knip` (must be clean after
> removing the `layouts/**` ignore entry) · **browser gate:**
> `e2e-check` — smoke set at 1280px, plus `/inbox`, `/inbox?tab=requests` and
> `/inbox/<chatId>` at both widths and both themes; the 390px pass must confirm
> the sidebar-hiding branch (`MOBILE_MEDIA_QUERY`, `(chat)/layout.tsx`). Edge
> case: send a message and confirm the optimistic/pending and failed-retry
> bubble states still render at the new badge and button scales.

---

**14. Empty, loading and error states — and the `/schedule` route shell.**

Files: `frontend/src/components/composites/{DataEmpty,SkeletonKit,AsyncBoundary}.tsx`;
`frontend/src/app/not-found.tsx`; `frontend/src/app/(main)/error.tsx`;
`frontend/src/app/(main)/schedule/page.tsx`.

**`/schedule` is migrated here.** It is the last `(main)` route with real UI and
no page frame: `schedule/page.tsx` imports `Calendar`, `AsyncBoundary`,
`DataEmpty`, `SkeletonKit` and `Card` — nothing from `@/components/layouts` —
and carries `<h2 className="text-2xl font-bold leading-8">Upcoming sessions</h2>`
at line 37, which A12's grep matches exactly. Without this, A10, A11 and A12 all
fail at step 15 with no owner. Wrap the route in `PageBody` + `PageHeader` +
`PageSection` and move that `<h2>` onto the `h2` type step. It is a ~77-line
route shell and the cheapest remaining A10/A11 win. **This does not touch the
calendar components** — `Calendar`, `DesktopGridCalendar` et al. stay as they
are, per Out of scope #8; only the surrounding page shell changes.

- `DataEmpty`: drop `border-dashed` (it reads as an unfinished wireframe) for a
  designed surface; make the illustration slot first-class so
  `WarmScholarEmptyArt` is the default rather than an opt-in `children`.
- `SkeletonKit`: **re-tune every hard-coded dimension** (`h-48`, `h-36`,
  `h-[440px]`, `h-[520px]`, `w-[340px]`) to match the new card padding and type
  scale. This is the desync risk called out in Current state §6.
- `AsyncBoundary`: pass a sensible default skeleton instead of a bare centred
  `Spinner`, or audit the 6 call sites that omit `loadingFallback` and give each
  the right `SkeletonKit` entry.
- Give `not-found.tsx` and `(main)/error.tsx` the illustration + `PageHeader`
  treatment so they stop being characterless.

> Verify: `pnpm --dir frontend lint` ·
> `grep -n 'text-2xl\|leading-8' frontend/src/app/\(main\)/schedule/page.tsx`
> returns nothing, and the file imports from `@/components/layouts` (A10/A11/A12
> for `/schedule`) · **browser gate:** `e2e-check` — `/does-not-exist` (404),
> plus `/schedule`, `/dashboard`, `/discover` and `/inbox` **with the network
> throttled** so the skeletons are actually on screen long enough to screenshot,
> at both widths and both themes. Compare the skeleton screenshot against the
> loaded screenshot from the same route: block heights must match within ~8px,
> which is the whole point of this step. Edge case: an account with no matches
> and no sessions, for the `DataEmpty` states.

---

**15. Accessibility, dark-mode and enforcement sweep.**

Files: `frontend/eslint.config.mjs`; `frontend/src/styles/globals.css`;
`frontend/src/app/(main)/layout.tsx`; `knip.json`.

- Re-run the contrast script against **both** themes after all the surface
  changes (steps 2, 5 moved `--muted`/`--surface`/`--surface-raised`, so the
  step-1 results are stale).
- **Finish the enforcement glob.** Steps 10, 12 and 13 already added
  `matches`, `profile`, `chat` and `inbox` as they cleaned each folder. What
  remains here is `src/features/**`, which the rule names but which does not
  exist (`eslint.config.mjs:62–64`) — either drop the dead glob entry or leave
  it with a comment explaining it is forward-looking.
  **`src/components/calendar/**` is deliberately NOT added.** It carries **10**
  violating literals under the real rule — `DesktopGridCalendar.tsx` 84, 106,
  125, 136, 183, 209; `TouchScreenCalendar.tsx` 53, 88; `Calendar.tsx` 137;
  `CalendarPopup.tsx` 300 — and no step in this plan restructures it, since Out
  of scope #8 declines to. Adding it to the glob would either fail A21 or
  silently force an unbudgeted rewrite of ~800 lines. Add an
  explicit `eslint.config.mjs` override that exempts
  `src/components/calendar/**` from the layering rule, with a comment naming
  the follow-up, so the exemption is visible and intentional rather than a
  glob that quietly forgot a folder. Track the calendar migration as separate
  work — see Out of scope #8.
- Confirm every new keyframe is listed in the `prefers-reduced-motion` block
  (`globals.css:105–111`).
- Verify A8 by re-running the density grep from step 5 (`-roE`, step-5 scope)
  and comparing against the recorded baseline of **73**; target ≤36.
- Verify A12: `grep -rnE '<h[1-3][^>]*className="[^"]*(text-(xl|2xl|3xl)|leading-[6-9])'`
  over `src/app` and the feature component folders returns nothing.
- **Verify the six criteria that no earlier step checks.** Each is named in a
  step *body* as an instruction but, before this round, had no command anywhere
  — an acceptance criterion with no command is a wish:
  - **A3** (dead tokens) — run its own grep verbatim:
    `grep -rl -- "<token>" frontend/src --include=*.tsx --include=*.css` must
    return more than `globals.css` for each of `--page-gutter`,
    `--content-max`, `--duration-slower`, `--ease-spring`; and must return
    **nothing** for `--pane-min`, which step 13 deletes.
  - **A6** (`--card-spacing` = 24px) —
    `grep -n 'card-spacing' frontend/src/components/ui/card.tsx` shows
    `--spacing(6)` as the default and `--spacing(4)` for `sm`. Also asserted as
    a computed style in step 5's browser gate.
  - **A7** (`PageSection` gap ≥ 2.5rem at `md+`) —
    `grep -n 'space-section\|--space-stack' frontend/src/components/layouts/PageBody.tsx`
    shows the token, not a literal `gap-8`.
  - **A10 / A11** (`PageHeader` + `PageBody`/`PageSection`) — for each
    content-bearing route, the route or a component it renders imports from
    `@/components/layouts`. Enumerate rather than spot-check: `/dashboard`,
    `/discover`, `/learning`, `/matches/[id]`, `/profile`, `/profiles/[id]`,
    `/inbox`, `/schedule`. **Exempt, per A10/A11's own list — do not flag
    these:** the four redirect-only routes (`matches/page.tsx`,
    `matches/active/page.tsx`, `calendar/page.tsx`, `(chat)/chats/page.tsx`),
    plus `/profile/edit` and `/inbox/[id]`, each for the reason recorded in
    A10/A11.
  - **A13** (`Container` from tokens) —
    `grep -n 'content-max\|page-gutter' frontend/src/components/layout/Container.tsx`
    matches, and `grep -n 'max-w-7xl' Container.tsx` returns nothing.
- Decide on `MobileTabBar`: `AppShell` has an unfilled `mobileNav` slot and
  `components/layout/MobileTabBar.tsx` has zero imports. Either wire it into
  `app/(main)/layout.tsx` (it is a genuine mobile-UX gap — navigation is
  currently behind a hamburger only) or delete it and drop its `knip.json`
  ignore entry. **Wiring it in is a behaviour change; flag it for the user
  rather than deciding unilaterally.**

> Verify: `pnpm --dir frontend exec node scripts/check-contrast.mjs` exits 0 ·
> `pnpm --dir frontend lint` (0 errors, warnings ≤ 10) ·
> `pnpm --dir frontend test` · `pnpm --dir frontend format:check` ·
> `pnpm check:types` · `pnpm knip` · `pnpm --dir frontend build` ·
> **browser gate:** `e2e-check` over the **full matrix** — `/dashboard`,
> `/discover`, `/learning`, `/schedule`, `/profile`, `/inbox`,
> `/inbox/<chatId>`, `/matches/<id>` at 1280px and 390px in both themes, plus a
> **keyboard-only traversal** (`Tab` through `/dashboard` → `/discover` →
> `/matches/<id>` → `/inbox`) confirming a visible focus ring on every stop and
> that the skip-link at `app/layout.tsx:39–44` still reaches `#main-content`.
> Also re-run with the OS set to `prefers-reduced-motion: reduce` and confirm no
> animation plays.

---

## Risks

**Token changes ripple into screens nobody re-checked.** This is the largest
risk and it is structural: steps 1–6 change values consumed by all 34 `ui/`
primitives and every screen. The mitigation is the ordering — tokens and
primitives land *first*, so the blast radius is inspected across all six named
routes in steps 1–6 before any screen is rewritten — plus the per-step visual
check list. Specific hazards: `--muted` is used as both a surface and a hover
state (splitting it in step 2 may make some hovers vanish); `--input` currently
aliases `--border`, so un-aliasing it in step 1 changes every form control at
once; the `session-*` colour pairs (`globals.css:173–184`) feed the calendar and
were not re-derived — check `/schedule` after step 2.

**Skeletons silently desync from content.** `SkeletonKit` hard-codes `h-48`,
`h-36`, `h-[440px]`, `h-[520px]`, `w-[340px]` to mirror today's layouts. After
steps 5–6 change card padding and type scale, every skeleton will be the wrong
height and loading states will visibly jump. Step 14 fixes this, but it is
invisible until someone throttles the network — easy to ship broken.

**The ESLint layering rule will block a naive implementation.** Any attempt to
add radius, elevation, borders or arbitrary sizes directly in
`src/app/**` fails lint (`eslint.config.mjs:60–82`) — including inside template
literals. New affordances *must* land in `components/composites/`. Conversely,
the rule does **not** currently cover
`src/components/{matches,profile,chat,inbox,calendar}`, so an implementer
working there gets no warning and can reintroduce exactly the ad-hoc values this
plan removes. Mitigation is now per-folder: each screen step ends by adding its
own folder to the glob (step 10 → `matches`, step 12 → `profile`, step 13 →
`chat`+`inbox`), so enforcement arrives with the cleanup rather than nine steps
later. **`calendar` is exempted on purpose** — 10 violations in a folder no step
restructures. That exemption is a real, acknowledged hole in the guardrail, not
a solved problem: someone can still add ad-hoc styling there.

**Landing the glob before the cleanup would break the build.** This is why the
glob is added at the *end* of each screen step rather than up front: adding
`components/chat/**` to the rule before step 13 cleans it would put 13 lint
errors on `main` and violate the plan's hard landability constraint. The cost of
this sequencing is that a folder is unguarded *during* its own step — mitigated
by the pre-flight grep documented at the end of step 7.

**Dark mode is currently the *better* theme, and that can invert.** Measured:
teach/learn badges are 6.09:1 / 7.07:1 in dark but 2.90:1 / 2.63:1 in light.
Step 1 deepens the light accents; if the same edits are mirrored into `.dark`
out of symmetry, dark mode regresses. Step 1 therefore explicitly touches
`:root` only. Additionally, the elevation strategy differs by theme (light
depends on shadow, dark on surface lightness), so step 5 must be checked twice.

**Motion and perf cost.** `framer-motion` is already a dependency but the
existing animations are pure CSS keyframes. Adding JS-driven animation would
regress Next 16 / React 19 streaming and hurt low-end devices; the plan's motion
posture (entrance-only, CSS, ≤180ms) exists to prevent that. The
`Card` `interactive` hover already animates `transform` and `box-shadow` —
animating `box-shadow` is a paint-heavy property, and raising the shadow alphas
in step 5 makes it more expensive on grids of 12+ `MatchCard`s.

**"Fully rebuild" invites unbounded scope creep.** The literal request has no
edge. Concrete temptations visible in the code that this plan deliberately does
*not* take: reworking the six-item nav; adding a landing/marketing page;
replacing the calendar implementation (`components/calendar/`, ~800 lines across
5 files); adding Playwright visual regression; rewriting product copy;
converting `AsyncBoundary` to Suspense. Each is defensible and each would double
the plan. They are enumerated in "Out of scope" so a reviewer can push back
explicitly rather than by omission.

**No *automated* regression net, and the browser gate is human-judged.**
One frontend test exists (`frontend/src/utils/user.test.ts`); the unit tests
added in step 7 cover the teach/learn contract only. The `e2e-check` browser
gate catches console errors, failed requests and gross layout breakage, and it
produces screenshots — but nothing **diffs** those screenshots, so a subtle
regression on a route that is rendering "fine" will pass. That is the specific
gap snapshot-diffing would close and why it is named in Out of scope #5 rather
than pretended away.

**The browser gate has a heavy prerequisite chain and will be skipped under
pressure.** It needs Docker, a Joi-valid `backend/.env` (including
`OPENAI_API_KEY` and four `AWS_*` vars), two dev servers, and a
signup-driven session because `backend/prisma/seed.ts:234` gives every seeded
user the unusable literal password `bot_account_no_login`. If the stack is
down, the realistic failure mode is an implementer running only lint and
typecheck and reporting the step green — which is exactly the verification
theatre this plan is trying to avoid. "Verification setup" therefore requires
that steps verified without the browser be reported as *partially verified*,
explicitly. Steps 11 and 14 are the most exposed: step 11 needs a generated AI
plan (BullMQ `ai` queue + a live OpenAI key), and step 14 needs deliberate
network throttling to see the states it changes.

**Font configuration can regress CLS.** Step 3 adds `axes`/`weight` to the
Fraunces `next/font/google` call. Requesting more axes increases the font
payload; a variable font with several axes can be noticeably larger. Check the
network panel after step 3 and constrain the axis list if the file grows
materially.

**Merge conflict surface.** Steps 1–6 touch `globals.css` repeatedly and steps
8–13 touch many screen files. If other work is in flight on `frontend/`, land
steps in order and rebase often; `globals.css` in particular will conflict
badly.

---

## Out of scope

Explicitly **not** done by this plan:

1. **Information architecture.** No change to `navLinks`, route groups, or the
   `/matches`→`/discover`, `/calendar`→`/schedule`, `/chats`→`/inbox` redirects.
2. **Any backend, API, Prisma or socket change.** Nothing under `backend/`.
3. **Data flow.** No changes to `services/*Service.ts`, `hooks/use*.ts`, query
   keys, or `SocketContext` invalidation. The only non-visual changes proposed
   are the `ProfileView` teach/learn variant bug (step 12) and the `<ol>`→`<ul>`
   semantic fix (step 11), both of which are presentation defects.
4. **Wiring `MobileTabBar` into `AppShell`'s `mobileNav` slot.** This is a real
   mobile-navigation gap (nav is hamburger-only today) and the component already
   exists unused — but adding a bottom tab bar is a behaviour/IA change. Step 15
   flags it for a decision; it is not planned here.
5. **Visual-regression *snapshot-diffing*** (Chromatic, Storybook, checked-in
   Playwright `toHaveScreenshot` baselines). Note this is narrower than it was
   in the first draft: **browser-driven verification is in scope and used by
   every step**, via the `playwright` MCP server in the repo-root `.mcp.json`
   and `frontend/.claude/skills/e2e-check/SKILL.md`. What is excluded is
   *storing and diffing* baseline images in CI, which would be the right
   long-term answer to the regression risk above but is its own project.
6. **A copywriting pass.** Only colon-suffixed layout labels (`"Bio:"`,
   `"Benefits:"`, `"Actions:"`) are touched.
7. **New illustrations or brand assets** beyond reusing the existing
   `SkillSwapMark` and `WarmScholarEmptyArt` (`components/illustrations/`) and
   `Logo` (`components/brand/`).
8. **Rewriting the calendar** (`components/calendar/`, ~800 lines across
   `Calendar`, `DesktopGridCalendar`, `TouchScreenCalendar`, `CalendarPopup`,
   `SessionDetails`). It inherits the token/primitive improvements from steps
   1–6 and is checked in the browser at step 2 (`/schedule`, because the twelve
   `--session-*` chip pairs are sensitive to the surface-ladder change), but it
   is not restructured. Its two `jsx-a11y/no-static-element-interactions`
   warnings (`DesktopGridCalendar.tsx:123,134`) are left as-is.
   **Consequence, stated plainly:** because the folder keeps its 16
   layering-rule violations, step 15 exempts `src/components/calendar/**` from
   the extended ESLint glob. Migrating those 16 literals into composites and
   removing the exemption is **follow-up work this plan deliberately does not
   budget** — folding it in would roughly double step 15 and is precisely the
   scope creep the Risks section warns about. It should be its own plan.
9. **Converting `AsyncBoundary` to React Suspense**, or adding `loading.tsx` to
   the routes that lack one (`discover`, `learning`, `schedule`, `inbox`).
10. **A landing / marketing page.** `(auth)`'s `AuthSplitPane` is the only
    marketing surface and is only re-checked for token drift, not redesigned —
    it is already the best-looking part of the app.
11. **Removing the stale `CLAUDE.md` note about `// #region agent log` blocks.**
    I grepped `frontend/src` and those blocks are already gone; the note is
    out of date, but editing `CLAUDE.md` is not part of this task.
12. **Redux/RTK usage.** `@reduxjs/toolkit` and `react-redux` are installed and
    listed in `knip.json`'s `ignoreDependencies`; whether they are still needed
    is a separate cleanup.
13. **Giving `/profile/edit` and `/inbox/[id]` a page frame.** Both are exempt
    from A10/A11 for the reasons recorded there — `/profile/edit` is a
    single-purpose form whose own heading a `PageHeader` would duplicate, and
    `/inbox/[id]` is a chat thread where `ChatThread` already renders an
    in-`Card` header with avatar and presence. `EditProfile.tsx` is limited to a
    one-line mechanical lift in step 12; redesigning its 293 lines is not
    budgeted. If a later plan wants uniform framing across *every* route, these
    two are where to start.

---

## Responses to review

Iteration 2. `plan-critic` returned **NEEDS_WORK** (3 blocking, 3 should-fix,
1 nit). Plan mode blocked writes to `docs/plans/`, so the review arrived as text
rather than as `docs/plans/ui-ux-redesign.review.md`. I re-checked every finding
against the code before responding; **all seven reproduce.** All seven are
fixed — none are disputed on substance, though B1 and B3 are resolved
differently from the critic's suggested remedy, with reasons given.

### B1 — ESLint glob extension was not "enforcement of an existing convention" — **FIXED, different remedy**

Confirmed. My own count (a slightly broader regex than the critic's, including
`border-[trblxy]` and `top-[`): `matches` 9, `profile` 9, `chat` 13, `inbox` 1,
**`calendar` 16** — e.g. `DesktopGridCalendar.tsx:72,83,84,106,125,183`,
`TouchScreenCalendar.tsx:53,88`. No step touches `components/calendar/**`, and
Out of scope #8 explicitly declines to, so the old step 15 would have failed
A21 or forced an unbudgeted ~800-line rewrite. The critic is right.

**Resolved differently in one respect.** The critic asked to land the glob for
`matches|profile|chat|inbox` *before* step 9. I did not, because it would put
32 lint errors on `main` the moment it lands and break the plan's hard
landability constraint — a step must never leave the repo red. Instead the glob
is added **per folder, as the final commit of the step that cleans that
folder**: step 10 adds `matches`, step 12 adds `profile`, step 13 adds
`chat`+`inbox`. Enforcement therefore arrives *with* the cleanup and holds for
every later step, with no red intermediate state. The residual gap — a folder is
unguarded during its own step — is mitigated by a pre-flight banned-pattern grep
documented at the end of step 7, and named in Risks rather than hidden.

For `calendar` I took the bounded option the critic offered and the coordinator
preferred: step 15 adds an **explicit `eslint.config.mjs` override exempting
`src/components/calendar/**`**, with a comment, so the hole is visible and
deliberate. Out of scope #8 now states the consequence and names the migration
as separate follow-up work rather than absorbing it.

### B2 — A18 unsatisfiable in dark mode — **FIXED**

Confirmed at `globals.css:212`: `--input: var(--border)` inside `.dark`, which
shadows anything written into `:root`, and dark `--border` measures 1.51:1
against `--background` — the same 1.4.11 failure as light's 1.35:1. Step 1's
"do not touch `.dark`" was applied too literally and left the gate permanently
red. Step 1 now sets a distinct `--input` in **both** `:root` and `.dark`, with
the critic's reasoning recorded inline: `--input` is a non-text border token, so
it touches none of the text pairs dark currently passes (teach 6.09, learn 7.07,
primary 7.19, muted-foreground 7.43). The narrower instruction that remains — do
not mirror the `--accent-teach`/`--accent-learn`/`--success` darkening into
`.dark` — is the part that was actually protecting dark mode. A18 updated to
require both themes explicitly.

### B3 — browser verification already exists; A27 was unrunnable — **FIXED, with a caveat the review did not surface**

Confirmed both artifacts: repo-root `.mcp.json` configures a `playwright` MCP
server, and `frontend/.claude/skills/e2e-check/SKILL.md` exists and does exactly
what the critic describes (navigate, interact, screenshot, console/network
checks, mandatory edge case). A4 was wrong and is corrected; Out of scope #5 is
narrowed to snapshot-diffing only; A27 is rewritten around the skill; and every
one of the 15 `> Verify:` blocks now ends in a browser gate with named routes, a
named edge case, and "clean console" as a pass condition.

**The caveat the review missed, which the coordinator asked me to check.** The
skill's own escape hatch — "unless a test user already exists from `backend`'s
Prisma seed data" — **does not apply to this repo.**
`backend/prisma/seed.ts:229–241` creates only `isBot: true` users with random
faker emails and the literal string `password: 'bot_account_no_login'`, not a
hash. No seeded user can authenticate. Driving any `(main)` route therefore
requires Docker (Postgres + Redis), a Joi-valid `backend/.env` including
`OPENAI_API_KEY` and four `AWS_*` vars (`src/config/env.validation.ts` blocks
boot otherwise), both dev servers, and **a real signup driven in the browser**.
That is executable, so the gate stands — but it is a genuine setup cost, so I
added a "Verification setup" subsection that establishes it once per session,
required that steps verified without it be reported as *partially verified*
rather than green, and added the skip-risk to Risks.

I also bounded the cost the critic flagged (5 routes × 2 themes × 2 viewports ×
15 steps = 300 checks): A27 now tiers it — a fixed 3-route smoke set for the
global-blast-radius token steps, and smoke-at-1280 plus the step's own routes
for screen steps.

### S1 — A9 unachievable because primitives override the base rule — **FIXED**

Confirmed: `card.tsx:7` carries `text-sm text-card-foreground`, `button.tsx:8`
carries `text-sm`, `badge.tsx:8` carries `text-xs`, all in their CVA *base*
classes. Since nearly every `(main)` surface renders inside a `Card`, step 3
alone would not have reached card interiors. Step 4 now moves `Button` and
`Badge` off their hard-coded sizes; step 5 replaces `text-sm` in
`cardVariants`' base and calls it out as the single highest-impact line for A9.
A9's verification changed from "spot-checked on /dashboard" to a grep over
those three files. Current state §2 gained two "base class" rows so the trap is
visible in the evidence section too. One addition of my own: `input.tsx:12`
already has `text-base md:text-sm`, where the `md:` override prevents iOS
Safari zoom-on-focus — step 4 now says to drop that override rather than
re-point it at 14px, so the guard is not silently lost.

### S2 — steps 4/6 degrade `/inbox/<chatId>` for nine steps — **FIXED**

Confirmed: `AppShell.tsx:39` is a `grid h-dvh overflow-hidden` shell,
`(chat)/layout.tsx:37` hard-codes `min-h-[min(75dvh,800px)]` and
`ChatThread.tsx:73` hard-codes `min-h-[min(70dvh,720px)]`, neither subtracting
header, footer or `AppShellMain` padding — which step 6 raises. `ChatComposer`
sets `min-h-10` / `size-10`, which step 4 raises. Both the `calc()`
re-derivation and the `--header-h` correction moved from step 13 into step 6,
in the same commit as the padding change. Step 4 now explicitly defers the
composer, and step 13 says not to reopen the work.

The stale-token claim also reproduces: `--header-h` is `3.5rem` (56px,
`globals.css:141`), but `AvatarMenu` renders `UserAvatar size="md"` = `size-12`
(48px) inside `Header.tsx`'s `py-3`, so the real header is ~72px, and
`ComingSessionWarning.tsx:64`'s `fixed top-(--header-h)` is already misaligned
today. Step 6's browser gate now asserts both the single-scrollbar condition and
the warning's alignment.

### S3 — contrast script under-specified — **FIXED**

Confirmed that `globals.css` is not a flat literal list: `--card: var(--surface)`
(119), `--popover: var(--surface)` (121), `--input: var(--border)` (139/212),
eight `--sidebar-*` aliases (165–172), and twelve `--session-*-bg` values
carrying alpha (173–184, 217–228). A script that skips what it cannot resolve
would exit 0 while proving nothing — which would have made the plan's only
automated a11y gate worthless. Step 1 now specifies four hard requirements:
resolve `var()` chains, composite `/ N%` colors over a **named** backdrop token
rather than guessing, tag each row text (4.5:1) vs non-text (3:1), and **exit
non-zero on any unresolvable token rather than skipping it**. The pair table is
checked into the plan: §9's 18 rows in both themes, plus the nine A18 non-text
rows, plus `--success` on both `--background` and `--card`. Step 1's verify block
also now requires proving the gate fails when a token is temporarily reverted.

### N1 — A8 baseline ambiguous; two defects in the command — **FIXED**

All three reproduce. I re-ran both scopes: full `frontend/src` gives 191, the
step-5 scope gives **73** (here lines and occurrences coincide, but the critic
is right that `-rnE | wc -l` counts lines and is the wrong tool for the claim).
And `--no-eslintrc` was removed in ESLint 9 flat config — that prefix was dead
code left in by accident. Step 5 now states the baseline as 73 → ≤36 over its
own scope, drops the `eslint` prefix, uses `-roE`, and explains why the 191
figure is deliberately *not* the target (it includes `components/ui/**`, where
tight gaps are correct). Step 15 compares against 73.

### Line-number corrections

Applied in Current state §2: `h-8` is `button.tsx:25` (was :24), `input.tsx:12`
(was :13); `h-5` is `badge.tsx:8` (was :7); `Button` `sm`/`xs` are `:27`/`:26`.
`card.tsx:7`, `AppShell.tsx:76` and `PageBody.tsx:13` were already exact and are
unchanged.

### Left as-is

The critic's "What's good" list — the §3 adoption table, the §9 contrast
baseline, the `ProfileView` metaphor bug at `ProfileView.tsx:27–31`/42/58, the
token-identity claims, and the A1 leverage argument — is unmodified except where
a fix above required touching adjacent text.

---

## Round 2

`plan-critic` re-reviewed and returned **NEEDS_WORK** (2 blocking, 2 should-fix,
1 nit), confirming R1's B2/S1/S3/N1 as genuinely fixed and **withdrawing its
original B1 remedy** — it agrees the per-folder glob resequencing is the better
structure and that the new finding is a mapping bug inside that approach. I did
not restructure. All five findings reproduce and all five are fixed.

### R2-B1 — the folder→file mapping doesn't close; 13 violations live in unnamed files — **FIXED**

Confirmed, and worse than sampled. I re-ran the plan's own regex per file across
all four folders rather than spot-checking. Orphaned violations by step:
**4** (`ModuleAccordion.tsx` 76/78/80/137, only "possibly" in step 11 — which
runs *after* step 10's glob commit), **6** (`EditProfile.tsx` 157/270 and
`AddSkills.tsx` 114/160/202/248, in no step's file list), **3**
(`ChatComposer.tsx:20`, `ChatsEmptyLanding.tsx:48`,
`components/inbox/InboxRequestsPanel.tsx:64`). Steps 10, 12 and 13 would each
have ended on a red commit — by 4, 6 and 3 errors, exactly as the critic
predicted. The headline "11 of 32" undercounts slightly against my broader
regex; the per-step breakdown matches mine exactly.

Fixes: `ModuleAccordion.tsx` moved from step 11's "possibly" into step 10's file
list; `EditProfile.tsx` + `AddSkills.tsx` added to step 12; `ChatComposer.tsx`,
`ChatsEmptyLanding.tsx` and `InboxRequestsPanel.tsx` added to step 13. Each of
those three steps now prints a **full per-file inventory table** with counts,
line numbers and a "nature of work" column, and each verify block gains a
folder-wide grep to run **before** the glob commit.

Per the coordinator's note, files with lint debt but no design task are marked
**"mechanical lift only"** with an explicit instruction not to redesign them —
`AddSkills.tsx` (286 lines) and `EditProfile.tsx` (293) especially. Step 11 now
states `ModuleAccordion.tsx` is already clear so it isn't touched twice.

One finding of my own while building the table: **`ProfileView.tsx` has zero
violations** despite being step 12's main design target and the home of the A15
metaphor bug. Step 12 now says so, because the natural assumption — that the
files needing redesign are the files carrying lint debt — is false here.

### R2-B2 — Verification setup is not executable; the routes it can't populate gate steps 1–6 — **FIXED**

Confirmed on every point. `REDIS_HOST` really is
`Joi.string().optional().allow('')` (`env.validation.ts:18`), so the backend
boots without Redis and silently disables BullMQ, killing the
`repeat: { every: 30_000 }` auto-accept repeatable I verified in
`QueueBootstrapService`. And a fresh `docker compose up -d` has no schema and no
rows, so `/discover` — in the fixed smoke set for *every* token step — would
screenshot `DataEmpty`.

Setup expanded from 5 items to 9: added `prisma migrate dev` (2) and
`prisma db seed` (3) with the consequence of skipping each spelled out; required
`REDIS_HOST=localhost` (4) with the BullMQ chain explained; and added item 8,
which adds a seeded bot as a friend and waits ≤30s for auto-accept so a real
`/inbox/<chatId>` exists **before step 6**, whose two named assertions otherwise
have nothing to run against.

One correction to the review: it says the empty `Skill` table blocks signup.
`SkillPicker`'s `addSkill` accepts free-typed strings, so signup still completes
without seed data — but `validation/signUp.ts:20–21` does enforce `.min(1)` on
both lists, and the *matching* is what breaks. I stated it that way rather than
repeating the stronger claim.

On the stop condition: the review is right that "partially verified" labelled
honestly but never blocked anything. There is now an explicit two-list rule —
step 7 and the glob-commit halves of steps 10/12/13 **may** be closed on
lint/grep evidence alone (their criteria are mechanical); steps 1–6, 8, 9, 11,
12, 14 and 15 **must not** be, because the browser is their only evidence. If
the stack won't come up, the instruction is to stop and report the blocker, and
affected steps stay **open**.

### R2-S1 — step 13's `SplitPane` adoption reverts step 6's fix — **FIXED, fork resolved**

Confirmed: `layouts/SplitPane.tsx:26` is
`cn("min-h-[min(75dvh,800px)] w-full", className)` — byte-identical to the
`(chat)/layout.tsx:37` value step 6 replaces with a `calc()`. Adopting it while
step 13 is told "do not re-open the `calc()` work" would have silently restored
the nested scrollbar.

Per the coordinator's instruction not to leave a fork: **decided — delete
`SplitPane` and `DetailPane`.** Reasons stated in step 13: the adopt branch
reintroduces the exact bug this plan exists to remove, and it would make a
resizable drag handle the primary chat layout, which no requirement asks for.
Step 13's file list now includes both files as deletions plus `knip.json`.

The critic correctly flagged the delete branch's cost — `--pane-min` loses its
last consumer and A3 fails. Rather than leave that dangling, **A3 is amended**:
`--pane-min` must be *deleted from `globals.css`*, verified by its grep
returning nothing at all, while the other four tokens must gain a consumer. A
deleted dead token satisfies A3's intent as honestly as a consumed one. Current
state §4 now also records that `SplitPane` carries the same viewport bug, so the
deletion reads as motivated rather than arbitrary.

### R2-S2 — six acceptance criteria have no command anywhere — **FIXED**

Confirmed: A3 shipped its own grep that no step ran; A6, A7, A10, A11 and A13
appeared only as instructions in step bodies. Step 15 gains a bullet running all
six as concrete commands — A3's grep verbatim (adjusted for the `--pane-min`
deletion above), a `card.tsx` grep for `--spacing(6)`, a `PageBody.tsx` grep for
the section token, an **enumerated** route-by-route check for A10/A11 (with
redirect-only routes explicitly exempted, since `matches/page.tsx`,
`calendar/page.tsx` and `chats/page.tsx` render no UI), and a `Container.tsx`
grep that must also show `max-w-7xl` gone.

Step 5's browser gate additionally gains a **computed-style** assertion that a
default `Card` resolves to 24px padding — the review's point that step 5 set
24px and then asked a human to judge "distinct planes" was fair, and it now
matches the pattern already used in step 4 (≥40px heights) and step 14
(skeleton-vs-loaded within ~8px).

### R2-N1 — line-number sweep missed two spots; leaked review vocabulary — **FIXED**

All three confirmed and corrected: A5 now reads `button.tsx:25` / `:29`,
`input.tsx:12`, `badge.tsx:8`; step 2 now says `rounded-4xl` is used at
`badge.tsx:8`. Step 4's "see S2 below" — a review ID with no referent in the
plan — now reads "handled in step 6."

I also found one the review didn't flag: **A8 still carried the stale 191/60
baseline** that round 1's N1 corrected in step 5 but not in the acceptance
criterion itself. A8 now states 73 → ≤36 and explains why 191 is not the target.

---

## Round 3

`plan-critic` returned **NEEDS_WORK** (1 blocking, 2 should-fix, 1 nit),
confirming the round-2 inventory tables reproduced line-for-line, accepting the
`SplitPane` deletion and A3 amendment, and conceding its own R2-B2 signup claim
was overstated. All four findings are fixed. **R3-S1 turned out to be larger
than the review diagnosed** — see below.

### R3-B1 — `/schedule` has no owning step, so A10/A11/A12 fail at step 15 — **FIXED**

Confirmed exactly. `app/(main)/schedule/page.tsx` imports `Calendar`,
`AsyncBoundary`, `DataEmpty`, `SkeletonKit` and `Card` — nothing from
`@/components/layouts` — and line 37 is
`<h2 className="text-2xl font-bold leading-8">`, which step 15's A12 grep
matches. Current state §4 already recorded the problem; no step body fixed it.

Per the coordinator's preference for extending over adding, **`/schedule` folds
into step 14**, whose title is now "Empty, loading and error states — and the
`/schedule` route shell." It is a ~77-line route shell, so this does not
meaningfully grow the step, and step 14's verify block gains a grep for the
`<h2>` plus a layouts import. Step count stays at 15. I noted explicitly that
this touches only the page shell, not the calendar components, so it does not
collide with Out of scope #8.

On the second half — `/profile/edit` and `(chat)/chats/[id]` — I took the
"write the exemption and its reason into the criterion" option rather than
giving them owning steps, because framing both would be genuine scope growth
(`EditProfile.tsx` is 293 lines) and would be wrong on the merits: `/profile/edit`
is a single-purpose form whose own heading a `PageHeader` would duplicate, and
`/inbox/[id]` is a chat thread where `ChatThread` already renders an in-`Card`
header with avatar and presence. A10/A11 now carry a full route enumeration
*with owning step numbers*, plus an explicit exemption list and a reason per
entry; step 15's enumeration was rewritten to match it exactly, and Out of scope
gains #13 recording both as deliberate non-goals. One correction to the review:
`(chat)/chats/[id]/page.tsx` is not a separate screen —
`inbox/[id]/page.tsx` is a bare `export { default } from "../../chats/[id]/page"`,
so both routes render one component, already owned by step 13.

### R3-S1 — the grep predicate is weaker than the rule — **FIXED, and the counts were wrong in *both* directions**

The review is right that the `className="` anchor misses literals inside
`className={cn(…)}`, and all five examples it cites are real
(`MatchCard.tsx:212`, `ChatMessageList.tsx:33`, `ChatSidebar.tsx:53/148/163`).

Per the coordinator's note 2 I re-derived the tables rather than patching the
command — and doing so surfaced a **second** error that neither the review nor
my round-2 pass caught. My grep also *over*-matched, because I never reproduced
the rule's `(?:^|\s)` anchor. Testing the exact regex from `eslint.config.mjs`
against real strings:

- `min-w-[220px]` → **clean**. `[hwp]-\[` needs a bare `w-[` at start or after
  whitespace; `min-w-[` does not qualify.
- `max-h-[170px]`, `pt-[21px]` → **clean**, same reason.
- `border-border flex justify-end border-b px-3 py-2` → **clean**, because
  `border(?:$|-[trblxy]?$)` only matches at end of string.

So the true counts, measured with a script that walks `className` attributes
(including through `cn()`) and applies the rule's own regex per literal, are:
**`matches` 4** (not 9 or 10), **`profile` 2** (not 9), **`chat` 15** (not 13 or
17), **`inbox` 0** (not 1), **`calendar` 10** (not 16). The method validates
against ground truth: it reports **0** for `src/app/**`, consistent with
`pnpm --dir frontend lint` passing today.

All three tables are re-derived with per-literal line numbers, and three files
left scope entirely because they have no violations at all: **`Matches.tsx`**,
**`AddSkills.tsx`** and **`InboxRequestsPanel.tsx`**. `AddSkills.tsx` is removed
from step 12's file list (round 2 had wrongly added it as a "mechanical lift").
Step 7's enforcement note, Current state §7's counts, Current state §4's
"would be ESLint errors" claim, and step 15's calendar count are all corrected
to match; §7 now documents both properties of the rule so this trap is visible
rather than re-derivable only by experiment.

Rather than fix the grep, **I removed the proxy entirely.** Steps 10, 12 and 13
now make the `eslint.config.mjs` glob change *first* and run
`pnpm --dir frontend lint` — the rule certifies itself, which is both simpler
and immune to this whole class of error. Step 7's pre-flight note tells the
implementer to temporarily add a folder to the glob and lint it, then revert.

`Matches.tsx`'s magic numbers are still removed in step 10 — they are a design
problem regardless — but the plan no longer misrepresents them as lint debt,
which matters because the tables are the definition of done for each glob commit.

### R3-S2 — design halves of steps 10 and 13 unclassified — **FIXED**

Confirmed: the stop condition named step 7 and the *glob halves* of 10/12/13 as
may-close, and listed 1–6, 8, 9, 11, 12, 14, 15 as must-not — leaving the
`Matches.tsx` page-frame adoption and the entire chat rebuild in neither bucket.
The must-not list now names "the design halves of steps 10 and 13" explicitly
(and step 12's, for symmetry), followed by a line stating that 10, 12 and 13
appear in both lists split by half and that no step is unclassified.

### R3-N1 — two loose ends — **FIXED**

(i) Confirmed: A3 required `--pane-min`'s deletion and step 15 *checked* it, but
no step body owned the edit. Step 13 now carries "delete the `--pane-min`
declaration from `globals.css:146` in this same commit," with `globals.css`
added to its file list (along with `layouts/index.ts`, which also needed the
`SplitPane`/`DetailPane` export removal), and its verify block greps for the
token's absence. (ii) Confirmed: `app/(main)/matches/active/page.tsx` is a
five-line `redirect("/learning")` and was missing from the exemption list. It is
now listed in both A10/A11 and step 15, bringing the redirect-only exemptions to
four.
