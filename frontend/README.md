# AntigenApp Frontend

React frontend built with [Vite](https://vite.dev/) and tested with [Vitest](https://vitest.dev/).

## Available Scripts

### `npm run dev`

Runs the Vite dev server on [http://localhost:3000](http://localhost:3000) with hot module replacement.

### `npm test`

Runs the test suite once via Vitest.

### `npm run test:watch`

Runs Vitest in watch mode, re-running tests on file changes.

### `npm run build`

Builds the app for production into the `build/` folder.

### `npm run preview`

Serves the production build locally for testing.

## Environment Variables

Vite exposes environment variables prefixed with `VITE_` via `import.meta.env`.

| Variable          | Description                               |
| ----------------- | ----------------------------------------- |
| `VITE_SENTRY_DSN` | Sentry DSN for error reporting (optional) |
