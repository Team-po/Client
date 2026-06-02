---
name: ux-writing
description: "Use when reviewing, rewriting, or creating Korean UX writing for Team-po product screens, including copy tone, labels, empty states, errors, onboarding, and user-facing microcopy."
---

# UX Writing

Use this skill when working on user-facing Korean copy in Team-po. The goal is to make copy clear, natural, and useful without over-explaining or sounding generated.

## Reference

Before making non-trivial copy changes, read `docs/UX_WRITING.md`. Use it as the product copy standard for tone, vocabulary, examples, and review checks.

## Workflow

1. Understand the flow before editing.
   - Check what screen the user is on, what they clicked, what happens next, and whether the action depends on auth, data state, or feature availability.
   - Copy must match behavior. Do not fix awkward text without checking the route or state behind it.
2. Inventory the strings.
   - Use `rg` to find related text.
   - Prefer existing constants or feature-level copy files when available.
   - Keep reusable copy close to the feature that owns the workflow.
3. Rewrite for the user's next decision.
   - Say what the user can do, see, or expect next.
   - Remove internal implementation language.
   - Keep one idea per sentence.
4. Check tone and consistency.
   - Prefer short Korean SaaS product copy with natural `-요` endings.
   - Keep terminology consistent across related screens.
   - Avoid inflated claims, generic AI-like phrasing, and unnecessary explanation.
5. Validate in context.
   - Review button labels, empty states, errors, and helper text in the actual UI structure.
   - Make sure copy fits mobile and compact components.

## Output Rules

- Keep changes scoped to user-facing strings and the smallest supporting logic needed for accurate copy.
- Do not introduce new product promises that the UI or backend does not support.
- Do not remove meaningful product terms just because they are technical; remove terms only when they are internal to implementation or unclear to users.
- For non-trivial repo changes, run:
  - `pnpm typecheck`
  - `pnpm biome lint .`
  - `pnpm build`

## Final Review

Before finishing, answer:

- Does each piece of copy help the user make the next decision?
- Does every label match what the action actually does?
- Are internal terms hidden unless users need them?
- Is the copy shorter without losing meaning?
- Is the tone consistent with nearby screens?
