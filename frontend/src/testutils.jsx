import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

/**
 * Configure global.fetch to dispatch responses based on URL patterns.
 *
 * @param {Object.<string, Function|Object>} handlers
 *   Keys are URL substrings; values are either:
 *     - a plain object (returned as { status: 200, json: () => data })
 *     - a function (url) => Promise<Response-like>
 *
 * Any URL that doesn't match returns a 404.
 */
export function mockFetch(handlers = {}) {
  global.fetch = vi.fn((url, _opts) => {
    for (const [pattern, handler] of Object.entries(handlers)) {
      if (url.includes(pattern)) {
        if (typeof handler === "function") {
          return handler(url, _opts);
        }
        // Plain object shorthand — return 200 with JSON body
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(handler),
        });
      }
    }
    // Fallback 404
    return Promise.resolve({
      status: 404,
      ok: false,
      json: () => Promise.resolve({ detail: "Not found" }),
    });
  });
}

/**
 * Render a component inside a MemoryRouter.
 *
 * @param {React.ReactElement} ui  - the element to render
 * @param {Object}  options
 * @param {string}  options.route  - the initial URL (default "/")
 * @param {string}  options.path   - the Route path pattern (default "/")
 * @returns {import("@testing-library/react").RenderResult}
 */
export function renderWithRouter(ui, { route = "/", path = "/" } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>,
  );
}
