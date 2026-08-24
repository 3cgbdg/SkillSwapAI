---
name: add-shadcn-component
description: Add or update a shadcn/ui component via the `shadcn` MCP server, then adapt it to this repo's design-token and layering rules. Use whenever a task needs a shadcn primitive that isn't already in frontend/src/components/ui.
---

Raw output from the shadcn registry will almost always violate this
repo's ESLint-enforced rules (`frontend/eslint.config.mjs`), because the
public registry ships components with literal Tailwind grays and
inline `rounded-*`/`shadow-*`/`border*` classes. This skill exists to
add the component *and* immediately conform it, rather than adding it
and finding out from a lint failure later.

## Prerequisites

The `shadcn` MCP server must be connected (`Codex mcp list`) — it shells
out to `pnpm dlx shadcn@latest mcp`. `frontend/components.json` is
already initialized (style `base-nova`, baseColor `neutral`, RSC on,
icon library `lucide`) — the MCP add flow reads this automatically, do
not pass conflicting style flags.

## Steps

1. Use the `shadcn` MCP's list/search tool to confirm the exact
   component name in the registry (names don't always match casual
   usage — e.g. "dropdown" is `dropdown-menu`).

2. Use the `shadcn` MCP's add tool to install it. This writes into
   `frontend/src/components/ui/` per the aliases in `components.json`.

3. Open the newly added file(s) and fix every violation of the two
   ESLint rules that apply repo-wide and in route code:
   - **Anywhere in `src/**`**: replace any `gray|neutral|slate|zinc-*`
     Tailwind utility or raw hex color with the semantic tokens defined
     in `frontend/src/styles/globals.css` (`bg-muted`,
     `text-muted-foreground`, `border-border`, `accent-teach`,
     `accent-learn`, etc.) — pick the token whose light/dark oklch
     values match the intent of the class being replaced, don't just
     find-and-replace blindly.
   - **If the component (or its usage) lands in `src/app/**` or
     `src/features/**`**: `rounded-*`, `shadow-*`, `border*`, and
     arbitrary-value classes (`h-[…]`, `text-[…]`, `gap-[…]`) aren't
     allowed there. If the raw shadcn component itself is pure UI
     primitive in `components/ui/`, that's fine as-is (the rule targets
     feature/route code) — but any usage site you write in
     `src/app/**`/`src/features/**` must not reintroduce those classes
     directly; wrap the customization in a `components/composites/`
     component instead, consistent with the existing layering
     (`components/ui/` → `components/composites/` → `components/layouts/`
     → route code).

4. If the component needs a composite wrapper (e.g. a pre-styled
   variant used in more than one route), add it under
   `frontend/src/components/composites/` and export it through that
   folder's `index.ts` barrel, per the existing pattern.

5. Run `pnpm --dir frontend lint` and confirm zero new violations
   before considering the component done.

## Notes

- Don't install a component "just in case" — only add what the current
  task actually needs.
- If a suitable composite already exists (`StatTile`, `SectionPanel`,
  `SkillPill`, `AsyncBoundary`, etc.), prefer reusing it over adding a
  new shadcn primitive that duplicates it.
