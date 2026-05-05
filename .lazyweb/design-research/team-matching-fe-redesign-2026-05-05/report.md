# Team-po FE Redesign Research

Date: 2026-05-05

## TL;DR

The strongest references pointed toward a calm, operations-first app: a compact
left navigation, status and next-action panels first, then progressively revealed
details. The redesign should feel less like a marketing page and more like a
daily tool for a small project team.

## LazyWeb Searches Run

- `SaaS team dashboard project lifecycle progress metrics workspace overview`
- `team collaboration workspace project status activity dashboard member cards`
- `onboarding matching questionnaire profile setup skills interests form web app`
- `developer productivity dashboard tasks project health metrics timeline`
- `profile settings account dashboard avatar upload security password danger zone web app`
- `team directory member cards roles status collaboration dashboard web app`
- `empty state dashboard onboarding call to action project management web app`
- `activity feed project timeline recent changes team collaboration dashboard`

## References That Informed The Redesign

| Reference | What was useful |
| --- | --- |
| Userlane dashboard | KPI cards, progress stages, and value streams made the dashboard feel action-oriented instead of decorative. |
| Are.na team channels | Team home as a browsable workspace with recent items and shared collections. |
| Codecademy onboarding quiz | Step-based choice UI works well for matching and skill/profile setup. |
| Opal goal selection | Simple radio-card preference selection with a clear continue action. |
| Userguiding team directory | Member cards with role/status metadata are easier to scan than long profile text. |
| Chameleon team management | Team/user tables, permissions, and status controls fit the future team admin surface. |
| Rippling profile dashboard | Profile setup works best as grouped action cards, not one long form. |
| Appcues onboarding dashboard | Checklist/resource-center patterns fit post-match setup guidance. |
| Glean activity dashboard | Timeline plus metric cards is a strong structure for project activity. |
| Timely project dashboard | Project table/status/progress controls are appropriate for team execution. |

## Design Principles Applied

- Decision-first dashboard: show what needs action now before supporting details.
- 3 to 5 primary signals per screen: status, lifecycle, checklist progress,
  team acceptance, or GitHub health.
- Progressive disclosure: keep tabs for rules/checklist/GitHub/chat, while the
  default team home summarizes the state.
- Functional color: keep the existing blue/indigo system as primary, with
  emerald/amber/rose only for health, warning, and destructive states.
- Auth flow as onboarding: login/signup should preview the product journey and
  reduce the sense of filling out a generic form.

## Web Research Cross-Check

Recent SaaS dashboard guidance consistently emphasized hierarchy, actionability,
and limited KPI count. Useful sources:

- https://designpixil.com/blog/saas-dashboard-ux-best-practices
- https://www.letsgroto.com/blog/saas-ux-best-practices-how-to-design-dashboards-users-actually-understand
- https://www.typenorm.com/articles/ux-clarity-saas-dashboards
- https://www.925studios.co/blog/saas-dashboard-design-examples-2026
- https://ztabs.co/blog/ux-design-for-saas

## Implementation Notes

- Preserve `/` and `/deck/*` by creating an internal app shell used only by
  `/login`, `/signup`, `/verify-email`, `/me`, `/match`, and `/team`.
- Reuse current Tailwind tokens and CSS variables.
- Avoid new dependencies.
- Keep API and domain logic untouched; redesign JSX around existing hooks and
  local demo state.
