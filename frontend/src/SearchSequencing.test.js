import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchSequencing from "./SearchSequencing";
import { mockFetch, renderWithRouter } from "./testutils";

jest.mock("@sentry/browser", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

const searchResponse = {
  matches: [
    {
      sequence_id: 101,
      sequencing_run: 42,
      nanobody_autoname: "Nb-001",
      cdr3_aa: "AARDVARK",
      sequence_alignment_aa: "FULLSEQ",
    },
    {
      sequence_id: 102,
      sequencing_run: 43,
      nanobody_autoname: "Nb-002",
      cdr3_aa: "BEARCAT",
      sequence_alignment_aa: "FULLSEQ2",
    },
  ],
};

const defaultProps = {
  onSetError: jest.fn(),
};

function renderSearch(props = {}) {
  return renderWithRouter(<SearchSequencing {...defaultProps} {...props} />);
}

describe("SearchSequencing", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  it("renders search input, radio buttons, and Search button", () => {
    renderSearch();

    expect(
      screen.getByPlaceholderText(/enter search sequence/i),
    ).toBeInTheDocument();
    expect(screen.getByText("CDR3")).toBeInTheDocument();
    expect(screen.getByText("Full Sequence")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("shows validation error for short query", async () => {
    renderSearch();

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "AB");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      screen.getByText(/search query must contain 4 or more letters/i),
    ).toBeInTheDocument();
  });

  it("shows 'Please enter a query' when Search is clicked with no query", async () => {
    renderSearch();
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByText("Please enter a query")).toBeInTheDocument();
  });

  it("renders results table with sequencing run links", async () => {
    mockFetch({ "/searchseq/": searchResponse });
    renderSearch();

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "AARDVARK");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText("Nb-001");
    expect(screen.getByText("AARDVARK")).toBeInTheDocument();
    expect(screen.getByText("Nb-002")).toBeInTheDocument();

    // Check NavLink to sequencing run
    const link = screen.getByRole("link", { name: "42" });
    expect(link).toHaveAttribute("href", "/sequencing/42");
  });

  it("shows 'No sequences found' after empty result", async () => {
    mockFetch({ "/searchseq/": { matches: [] } });
    renderSearch();

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "XYZXYZ");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText(/no sequences found for XYZXYZ/i);
  });

  it("calls onSetError when HTTP error occurs", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/searchseq/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderSearch({ onSetError });

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "AARDVARK");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[SS] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry on network error", async () => {
    const Sentry = require("@sentry/browser");
    const onSetError = jest.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = jest.fn(() => Promise.reject(networkError));
    renderSearch({ onSetError });

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "AARDVARK");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });
});
