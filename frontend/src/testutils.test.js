import React from "react";
import { screen } from "@testing-library/react";
import { mockFetch, renderWithRouter } from "./testutils";

describe("mockFetch", () => {
  afterEach(() => {
    delete global.fetch;
  });

  it("returns fallback 404 response when no handler matches", async () => {
    mockFetch({ "/known/": { ok: true } });

    const response = await global.fetch("https://example.com/unknown/");

    expect(response.status).toBe(404);
    expect(response.ok).toBe(false);
    await expect(response.json()).resolves.toEqual({ detail: "Not found" });
  });

  it("forwards url and options to function handlers", async () => {
    const handler = jest.fn((url, opts) =>
      Promise.resolve({
        status: 201,
        ok: true,
        json: () => Promise.resolve({ url, method: opts.method }),
      }),
    );
    mockFetch({ "/known/": handler });

    const response = await global.fetch("https://example.com/known/", {
      method: "POST",
    });

    expect(handler).toHaveBeenCalledWith("https://example.com/known/", {
      method: "POST",
    });
    await expect(response.json()).resolves.toEqual({
      url: "https://example.com/known/",
      method: "POST",
    });
  });
});

describe("renderWithRouter", () => {
  it("renders UI at the supplied route and path", () => {
    renderWithRouter(<div>Router content</div>, {
      route: "/testing",
      path: "/testing",
    });

    expect(screen.getByText("Router content")).toBeInTheDocument();
  });
});
