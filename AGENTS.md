# Repository Guidelines

## Project Structure & Module Organization

This repository contains a JavaScript React application bootstrapped with Create React App.

- `src/`: application code, component styles, and imported assets. `index.js` mounts the app; `App.js` defines the main screen.
- `src/App.test.js`: component tests; `src/setupTests.js` loads jest-dom matchers.
- `public/`: HTML entry template, icons, manifest, and other static assets.
- `Dockerfile.dev` and `docker-compose.yaml`: development containers and a separate test service.
- `Dockerfile`: builds production assets and serves them through Nginx.
- `.github/workflows/deploy.yml`: verifies changes and deploys `master` to Elastic Beanstalk; setup is in `docs/aws-deployment.md`.
- `build/` and `coverage/`: generated output excluded from Git.

## Build, Test, and Development Commands

- `npm install`: install dependencies; no dependency lockfile is currently tracked.
- `npm start`: run the development server at `http://localhost:3000` with live reload.
- `npm run build`: create optimized production assets in `build/`.
- `npm test`: launch Jest in interactive watch mode.
- `CI=true npm test -- --watchAll=false`: run tests once for automated checks.
- `npm test -- --watchAll=false --coverage`: generate a coverage report.
- `docker compose up --build web`: build and start the containerized development server on port 3000.
- `docker compose run --rm -e CI=true tests npm test -- --watchAll=false`: run containerized tests once.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and functional React components. Name components in PascalCase, such as `App.js`, and functions and variables in camelCase. Keep component styles and tests alongside their components (`App.css`, `App.test.js`). Match the surrounding file's quote style; existing files use both styles.

ESLint extends `react-app` and `react-app/jest` through `package.json`. No standalone lint script or formatter configuration is present.

## Testing Guidelines

Use Jest and React Testing Library with jest-dom assertions. Name tests `*.test.js` and describe observable behavior. Prefer accessible role or label queries. Add or update tests when changing behavior; no coverage threshold is configured.

## Commit & Pull Request Guidelines

History is limited: it includes the initial scaffold and `feat: added docker configuration`. Follow the latter's type-prefixed style, for example `fix: update app link assertion`.

For pull requests, describe the change, link relevant issues, and report test/build results and known failures. Include screenshots for visible UI changes and verification commands for Docker changes.
