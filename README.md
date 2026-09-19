# plainform.github.io

Reference pages on two EU regulations whose requirements leave evidence in
source code: the **Cyber Resilience Act** and the **European Accessibility
Act**.

Live at <https://plainform.github.io/>.

## What is here

| Page | Covers |
|---|---|
| `/` | Why these two regulations, and what the checkers will never claim |
| `/cra/` | Regulation (EU) 2024/2847 by date: the staged timeline, scope, the three penalty tiers, and which obligations produce a document |
| `/cra/article-14-reporting/` | The reporting obligation in force since 11 September 2026: the 24h / 72h / 14-day stages, where reports go, what to write down |
| `/cra/sbom/` | What Annex I Part II(1) actually asks for: format, depth, timing, audience |
| `/eaa/` | The EAA, EN 301 549, the clause-to-WCAG mapping, and the 30–40% limit of automated testing |

## How it is built

Plain static HTML and one stylesheet. No build step, no JavaScript, no web
fonts, no analytics, no third-party requests of any kind. A page is a file.

That is partly taste and partly the subject matter: a site arguing that
accessibility and security obligations are checkable should not need a
toolchain to render a paragraph.

## Checks

```bash
node test/check.mjs
```

Two assertions, and the first is the one that matters:

**The site runs `eaa-lint` on itself and must come back with zero findings.**
These pages sell an accessibility checker. A marketing site for one that fails
its own tool has not made a small mistake — it has lost the argument. The check
pulls the published package from npm, so it tests the same thing a reader would
get.

**Every colour pair meets WCAG 1.4.3 AA.** The palette lives in CSS custom
properties, and the checker's contrast rule only fires on literal colour pairs
inside a single rule — so it cannot see through `var()`. The ratios are
computed in the test instead, for the pairs that actually appear together.

## The tools these pages are about

- [`cra-ready`](https://github.com/plainform/cra-ready) — `npx cra-ready ./your-project`
- [`eaa-audit`](https://github.com/plainform/eaa-audit) — `npx eaa-lint ./src`

Both free, MIT, zero dependencies, no network calls.

## Licence

Content and code: MIT. See [LICENSE](LICENSE).

These pages summarise regulations to be useful. They are not legal advice and
not a substitute for the texts, which are linked throughout.
