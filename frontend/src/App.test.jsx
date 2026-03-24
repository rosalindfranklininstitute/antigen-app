import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import App from "./App";
import config from "./config.js";

afterEach(() => {
  cleanup();
  delete global.fetch;
});

it("renders without crashing", async () => {
  // App's useEffect fetches several endpoints on mount
  global.fetch = vi.fn((url) => {
    let data = {};
    if (url.includes("/dashboard/stats")) data = { stats: [] };
    else if (url.includes("/dashboard/latest")) data = { logs: [] };
    return Promise.resolve({
      status: 200,
      url: config.url.API_URL + "/userinfo",
      ok: true,
      json: () => Promise.resolve(data),
    });
  });

  await act(async () => {
    render(<App />);
  });
});
