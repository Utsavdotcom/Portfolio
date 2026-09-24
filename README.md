# Utsavdotcom

Utsav Poudel's portfolio: plain HTML, CSS, and JavaScript, with no production dependencies. The contact form uses Web3Forms. All project demos run locally in the browser with fictional data.

## Development

Use **Node.js 24 or newer** and Chrome. The version is recorded in `.nvmrc`.

```sh
npm ci
npm run check
npm start
```

Open http://127.0.0.1:8766. The preview serves `dist/`; run `npm run build` after source changes. To use Playwright's bundled Chromium instead of installed Chrome, run `npx playwright install chromium` and set `PLAYWRIGHT_CHANNEL=chromium` in your shell before testing.

## Structure

- `index.html`: the only source page, including the SVG carousel model.
- `assets/css/portfolio.css`: responsive layout and animations.
- `assets/js/theme-init.js`: restores the theme before rendering.
- `assets/js/app.js`: theme controls, entrance, auction, and carousel.
- `assets/js/contact.js`: validation, delivery, and error handling.
- `assets/js/project-demos.js`: HIP and Plexi demonstrations.
- `assets/js/rotating-type.js`: uniform 3.5-second letter transitions.
- `assets/js/particles.js`: opt-in mouse and phone-tilt effect.
- `assets/images/`: the five images used by the site.
- `assets/resume.pdf`: the current resume.
- `site-config.js`: **public** Web3Forms configuration.
- `scripts/`: public-file build and loopback-only preview server.
- `tests/`: browser regression and security checks.
- `docs/audit.md`: audit scope, findings, and release checklist.

## Checks

`npm run lint` checks JavaScript. `npm run format:check` checks formatting. `npm run build` creates a fresh public-only `dist/`. `npm test` runs browser tests against that output. `npm run check` runs all four in order. `npm audit` checks development dependencies; there are no runtime packages and no TypeScript compilation step.

Browser tests intercept email requests: **they never send messages**. They cover the contact lifecycle, project interactions, input escaping, responsive layouts, reduced motion, assets, and GitHub Pages subpaths.

## Contact form

The access key is a public recipient identifier, not a secret. Do not put passwords or private API keys in this repository or in browser code. No `.env` file is needed for this static site; an environment variable would not hide a key included in the delivered page.

Emails contain the visitor's name, email, and message. Reply-To points to the visitor. The subject is `Portfolio inquiry from [Name] | Utsavdotcom`. The receiving email is controlled by the Web3Forms account associated with the key. The `contactEmail` setting only controls fallback text.

Delivery has been confirmed by the site owner. After deployment, send one deliberate test from the live site. The provider handles spam filtering; the form also has a honeypot. Client-side validation does not prevent direct abuse of a public endpoint. If spam becomes a problem, configure provider-side CAPTCHA or restrictions in Web3Forms.

## Publication

Nothing is deployed by these scripts. `npm run build` copies only `index.html`, `site-config.js`, and `assets/` into `dist/`, plus `.nojekyll`. Publish **the contents of `dist/`** using a GitHub Pages deployment workflow. Never upload `node_modules`, local backups, or test output. The source page also supports root-based static hosting; the build output is preferred because it excludes development files.

Relative paths work at `/Portfolio/` and at a custom domain root. Enable HTTPS in the hosting settings. GitHub Pages does not expose arbitrary response-header configuration: the page uses a meta Content Security Policy, but policies such as `frame-ancestors` require HTTP headers on a host that supports them.

The old portfolio, unused PHP mail handler, duplicate resumes, and unused font/image collections were removed after checking references and uncommitted changes. Git history was not rewritten. The existing tracked `.vscode/settings.json` is a harmless local port preference and was preserved.
