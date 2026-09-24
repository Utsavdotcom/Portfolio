# Production audit — September 24, 2026

## Scope and findings

Reviewed the active HTML, CSS, scripts, images, resume references, Git index, and 48 historical text blobs. Pattern-based secret scanning found no private keys, common access-token formats, or hardcoded credential assignments. This is not proof that every possible secret is absent; Git history was not rewritten.

- Removed the unused PHP mail handler, which placed unvalidated input in mail headers. It was not executed by the active static site, but retaining it would create risk on a PHP-enabled host.
- Prevented the contact form's default GET submission from exposing message text in a URL when JavaScript fails: initial disabled submission, POST fallback, explicit email alternative, and CSP `form-action 'none'`. JavaScript delivery uses fetch to the single permitted Web3Forms endpoint.
- Added CSP with same-origin scripts, no inline JavaScript/eval, no plugins, and no base-URL overrides. Inline styles remain allowed because the animation and SVG use dynamic styling. Added a referrer policy.
- Extracted contact handling from the visual interactions. Preserved duplicate suppression, timeout, validation, honeypot, and error handling. A successful request no longer clears edits made while it was in flight. Ambiguous failures no longer imply delivery certainly failed.
- Fixed reduced-motion changes to return typography to the static name, rather than freezing on an unrelated word. Removed stale controls and unused code.
- Delayed particle allocation until the effect is enabled. Removed repeated live-region updates on every orientation event.
- Confirmed Plexi user input is inserted with `textContent`, not interpolated into HTML. Dynamic HTML elsewhere contains only fixed templates and internal state.
- Checked all retained images for GPS EXIF metadata; none was present.
- Removed 74 unchanged, unreferenced legacy files totaling 38,851,589 bytes. The removal manifest is `removed-files.json`. The original logo was relocated, not discarded. A pre-audit backup exists outside the repository.
- Organized runtime assets; added formatting, linting, a pinned development lockfile, tests, a tailored `.gitignore`, and a build that includes public files only. Existing uncommitted work and local editor settings were preserved.

## Release checks

Run `npm run check` and `npm audit` with Node 24+. There are no runtime dependencies and no TypeScript compiler or framework build. The build is an explicit public-file copy, not a bundler.

The browser suite exercises local assets, anchor IDs, responsive widths, GitHub Pages subpaths, automatic typography, reduced motion, lazy particles, persistent theme, auction validation, HIP handoffs, Plexi roles and HTML injection, all four carousel panels, and mocked contact outcomes. No test sends email.

## Verified results

- `npm run check` completed successfully on Node 24: lint, formatting, public build, and **13 browser tests passed**.
- `npm audit`: **0 known vulnerabilities**, including development dependencies.
- Checked 14 local resource paths, desktop/mobile screenshots, and Git whitespace checks. The public build is approximately **957 KB** including photos and resume.
- Windows sandbox process cleanup blocked the first runner exit; the complete final suite exited successfully outside the sandbox. No website change was needed for that environment limitation.

## Remaining publication checks

- Publish the contents of `dist/` and enable HTTPS. No push, commit, or deployment was performed during this audit.
- Test phone tilt on real iOS/Android hardware over HTTPS. Browser emulation cannot establish physical sensor behavior.
- Send one intentional form submission from the live domain. Local delivery was already confirmed by the owner; provider settings and spam handling remain external to this repository.
- The Web3Forms access key is intentionally public. Optional provider-side CAPTCHA/domain restrictions may require account setup or a paid plan.
- GitHub Pages cannot supply custom security headers through this repository. Meta CSP cannot enforce `frame-ancestors` or HSTS. Use host-level headers if a future host supports them.
- Local browser automation uses Chrome. Other browser engines have not been certified by this audit.
