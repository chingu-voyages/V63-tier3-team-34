# V63 Tier 3 Team 34

Full-stack app built by a Chingu Voyage team.

**Stack**

- `client/` – React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- `server/` – Express 5, TypeScript, Node 24
- PostgreSQL 17 (via Docker)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Node.js](https://nodejs.org/) 24+ and npm (for your editor, lint and type-checking on your machine)
- macOS / Linux: `make` (preinstalled on macOS and most Linux distros)
- Windows: [Git for Windows](https://git-scm.com/download/win), which also provides the shell the git hooks run under

## First-time setup

There are two ways to run the project, depending on your OS. Both give you hot reload and the same URLs.

| OS            | How it runs                                                                  | Command       |
| ------------- | ---------------------------------------------------------------------------- | ------------- |
| macOS / Linux | Everything in Docker: client, server and Postgres containers, source mounted | `make dev`    |
| Windows       | Postgres in Docker; client and server run natively with Node                 | `npm run dev` |

### macOS / Linux

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Node.js](https://nodejs.org/) from their installers (or `brew install --cask docker` and `brew install node`). Start Docker Desktop before running `make dev`. Node is still needed on your machine even though the app runs in containers: your editor, lint and the git hooks use it.

```bash
git clone https://github.com/chingu-voyages/V63-tier3-team-34.git
cd V63-tier3-team-34
cp .env.example .env          # optional – every value has a default
make dev                      # installs dependencies and git hooks, then starts everything
```

### Windows

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Node.js](https://nodejs.org/) and [Git for Windows](https://git-scm.com/download/win) from their installers. WSL is **not** required; everything below works from PowerShell, cmd or Git Bash.

```bash
git clone https://github.com/chingu-voyages/V63-tier3-team-34.git
cd V63-tier3-team-34
npm install                   # installs root, client/ and server/ dependencies and the git hooks
npm run dev                   # starts Postgres in Docker, then the server and client natively
```

Why the difference: `make dev` bind-mounts the source folders into Linux containers. On Windows, file-change events don't cross from the Windows filesystem into Docker, so hot reload silently stops working. Running Node natively avoids that. Line endings are forced to LF by `.gitattributes`, so you don't need to change `core.autocrlf`.

### What you get

| Service  | URL                                                            |
| -------- | -------------------------------------------------------------- |
| Client   | http://localhost:5173                                          |
| Server   | http://localhost:3000/api                                      |
| Postgres | localhost:5432 (user/pass/db: `postgres` / `postgres` / `app`) |

Edit files in `client/src` or `server/src` and the changes are picked up automatically. The client forwards `/api/*` requests to the server, so use relative URLs like `fetch('/api/health')` in frontend code.

## Installing a package

**Windows (`npm run dev`):** just `npm install some-lib` inside `client/` or `server/`. The apps run natively, so there's nothing else to do.

**macOS / Linux (`make dev`):** dependencies live in two places: on your machine (so your editor, lint and `tsc` see them) and inside the containers (what actually runs). They're kept separate on purpose so the Linux install in the container never clashes with the one on your machine.

```bash
cd server && npm install some-lib     # or cd client – installs on your machine
make sync-be                          # or make sync-fe – restarts that dev container, which re-installs
```

`make sync` does both. If you import the library before syncing, the container crashes with a "module not found" error until you run the sync. That's expected and harmless.

Teammates who pull your branch don't need to do anything: their next `make dev` or `npm install` installs from the updated lockfile.

### Adding shadcn/ui components

```bash
cd client && npx shadcn@latest add card input dialog
```

Components land in `client/src/components/ui/` and are imported as `@/components/ui/card` etc. On macOS / Linux, if the command pulls in new dependencies, run `make sync-fe` afterwards.

## Linting, formatting and git hooks

- **Linting:** [oxlint](https://oxc.rs/docs/guide/usage/linter) in both apps. `npm run lint` / `npm run lint:fix`, or `make lint` for both.
- **Formatting:** [Prettier](https://prettier.io), config in [.prettierrc](./.prettierrc) at the root. `npm run format`, or `make format` for everything.
- **Editor:** see [Editor setup](#editor-setup-vs-code) below.

A pre-commit hook (via [Husky](https://typicode.github.io/husky) and [lint-staged](https://github.com/lint-staged/lint-staged)) runs on every commit:

1. `oxlint --fix` on staged `.ts`/`.tsx` files: auto-fixable problems are fixed, anything else fails the commit.
2. `prettier --write` on staged code, CSS, JSON, Markdown and YAML files.
3. The fixed files are re-staged, so what you commit is what the hook produced.

The hook is installed automatically by `make dev` / `make install` (macOS / Linux) or `npm install` at the root (Windows). If commits aren't being checked, run `npm install` from the root. To skip the hook once (don't make a habit of it): `git commit --no-verify`.

### Editor setup (VS Code)

The repo ships a `.vscode/` folder with recommended extensions and format-on-save already configured. When you open the project, VS Code shows a **"This workspace has extension recommendations"** prompt. Click **Install All** and you're done.

If you missed the prompt, install them by hand. Open the Extensions view (`Cmd+Shift+X` on macOS, `Ctrl+Shift+X` on Windows/Linux), search for each and click Install:

| Extension                 | ID                          | What it does                                     |
| ------------------------- | --------------------------- | ------------------------------------------------ |
| Oxc                       | `oxc.oxc-vscode`            | Shows oxlint errors inline as you type           |
| Prettier - Code formatter | `esbenp.prettier-vscode`    | Formats on save using the repo's `.prettierrc`   |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocomplete and hover docs for Tailwind classes |

Or from a terminal:

```bash
code --install-extension oxc.oxc-vscode
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

**Format on save** is turned on by `.vscode/settings.json`, which sets Prettier as the default formatter for TypeScript, JavaScript, JSON, CSS, Markdown and YAML. It only applies while this repo is open, so it won't change how your other projects behave.

If saving a file doesn't format it, check that:

1. The Prettier extension is installed and enabled.
2. The root `npm install` has run (`make install` does this too), so the extension can find Prettier and the config.
3. Your user settings don't override `editor.defaultFormatter` for that language. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`), run **Format Document With...**, and pick **Configure Default Formatter** → Prettier.

To format a file on demand without saving: `Shift+Option+F` on macOS, `Shift+Alt+F` on Windows/Linux.

## Everyday commands

Run these from the repo root. `make` with no arguments lists every make target.

| Task                                   | macOS / Linux    | Windows                        |
| -------------------------------------- | ---------------- | ------------------------------ |
| Client + server + database, hot reload | `make dev`       | `npm run dev`                  |
| Server + database only                 | `make dev-be`    | `npm run dev:be`               |
| Client only (no API behind it)         | `make dev-fe`    | `npm run dev:fe`               |
| Database only                          | `make db`        | `npm run db`                   |
| Stop containers, keep database data    | `make down`      | `npm run down`                 |
| Stop and delete database data          | `make clean`     | `docker compose down -v`       |
| Follow container logs                  | `make logs`      | `npm run db:logs`              |
| Lint client and server                 | `make lint`      | `npm run lint`                 |
| Type-check client and server           | `make typecheck` | `npm run typecheck`            |
| Run tests                              | `make test`      | `npm test`                     |
| Format everything with Prettier        | `make format`    | `npm run format`               |
| Build and run the production images    | `make up`        | `docker compose up --build -d` |

Both paths share the same `package.json` scripts underneath, so `npm run ...` works on macOS too if you'd rather not use Docker for the apps.

## Tests and CI

Tests use [Vitest](https://vitest.dev) in both apps. Files are named `*.test.ts` / `*.test.tsx` and live next to the code they test. Run `npm test` in `client/` or `server/` (or `npm run test:watch` while developing), or `npm test` / `make test` at the root for both.

- **Client:** [Testing Library](https://testing-library.com/docs/react-testing-library/intro) with jsdom. See `client/src/App.test.tsx` for the pattern.
- **Server:** [Supertest](https://github.com/ladjs/supertest) against the Express app without starting a listener. See `server/src/app.test.ts`.

GitHub Actions runs on every push to `main` and every pull request ([.github/workflows/ci.yml](./.github/workflows/ci.yml)):

1. **Lint, typecheck, test, build**: `format:check`, `lint`, `typecheck`, `test` and `build` for both apps.
2. **Docker build + smoke test**: builds both production images, starts the full compose stack, and checks that the client page and the API health endpoint respond.

Both jobs must pass before merging.

There is no deployment step yet. When the team picks a host, a deploy job goes at the end of this workflow.

## Environment variables

- **macOS / Linux (`make`) and production images:** Docker reads the root `.env`; copy [.env.example](./.env.example) to change ports or database credentials. Every value has a default.
- **Windows (`npm run dev`):** the natively running server reads `server/.env`; copy `server/.env.example` to change `PORT`, `CLIENT_ORIGIN` (allowed CORS origin) or `DATABASE_URL`. Defaults work out of the box.

## Our Team

Everyone on your team should add their name along with a link to their GitHub
& optionally their LinkedIn profiles below. Do this in Sprint #1 to validate
your repo access and to practice PR'ing with your team _before_ you start
coding!

- Teammate name #1: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
- Teammate name #2: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)

  ...

- Teammate name #n: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
