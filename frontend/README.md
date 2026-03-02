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

### Build-time variables

`VITE_*` variables are inlined into the JS bundle at build time by Vite. They must be
set when running `docker build` (or `npm run build`), not at container runtime.

| Variable          | Description                               |
| ----------------- | ----------------------------------------- |
| `VITE_SENTRY_DSN` | Sentry DSN for error reporting (optional) |

To build a production image with Sentry enabled:

```sh
docker build --target prod --build-arg VITE_SENTRY_DSN=https://... -t antigenapp-frontend .
```

### Runtime variables

These are applied by `nginx-check-env.sh` at container start via `sed` on `index.html`.

| Variable      | Description                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENVIRONMENT` | Deployment environment name (e.g. `staging`). When set to anything other than `production`, adds a `preproduction` CSS class to `<html>` for visual distinction. |
