import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlastSequencing from "./BlastSequencing";
import { mockFetch } from "./testutils";
import * as Sentry from "@sentry/browser";

vi.mock("@sentry/browser", () => ({
  captureException: vi.fn(),
  init: vi.fn(),
}));

const blastResponse = {
  hits: [
    {
      query_title: "Query_1",
      subject_title: "Subject_1",
      query_seq: "ACGT",
      midline: "||||",
      subject_seq: "ACGT",
      query_cdr3: "",
      align_len: 50,
      align_perc: 90,
      e_value: "2e-5",
      bit_score: 150,
      submatch_no: 1,
    },
  ],
};

const defaultProps = {
  onSetError: vi.fn(),
};

describe("BlastSequencing", () => {
  afterEach(() => {
    delete global.fetch;
    vi.restoreAllMocks();
  });

  it("renders search input, radio buttons, and Search button", () => {
    render(<BlastSequencing {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(/enter search sequence/i),
    ).toBeInTheDocument();
    expect(screen.getByText("CDR3")).toBeInTheDocument();
    expect(screen.getByText("Full Sequence")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("shows validation error for short query", async () => {
    render(<BlastSequencing {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "ABC");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      screen.getByText(/search query must contain 6 or more letters/i),
    ).toBeInTheDocument();
  });

  it("calls fetch with correct URL on valid search", async () => {
    mockFetch({ "/blastseq/": blastResponse });
    render(<BlastSequencing {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "ACGTACGT");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/blastseq/ACGTACGT/?searchRegion=cdr3"),
        expect.any(Object),
      );
    });
  });

  it("renders results via BlastResultsTable after successful fetch", async () => {
    mockFetch({ "/blastseq/": blastResponse });
    render(<BlastSequencing {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "ACGTACGT");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await screen.findByText("50 (90%)");
    expect(screen.getByText("2e-5")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("calls onSetError when HTTP error occurs", async () => {
    const onSetError = vi.fn();
    mockFetch({
      "/blastseq/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    render(<BlastSequencing {...defaultProps} onSetError={onSetError} />);

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "ACGTACGT");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[BS] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry on network error", async () => {
    const onSetError = vi.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = vi.fn(() => Promise.reject(networkError));
    render(<BlastSequencing {...defaultProps} onSetError={onSetError} />);

    const input = screen.getByPlaceholderText(/enter search sequence/i);
    await userEvent.type(input, "ACGTACGT");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });
});
