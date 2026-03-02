import React from "react";
import { screen, waitFor } from "@testing-library/react";
import BlastResults from "./BlastResults";
import { mockFetch, renderWithRouter } from "../testutils";

jest.mock("@sentry/browser", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

const blastResponse = {
  hits: [
    {
      query_title: "Query_1",
      query_cdr3: "AAAA",
      subject_title: "Subject_1",
      query_seq: "ACGT",
      midline: "||||",
      subject_seq: "ACGT",
      align_len: 4,
      align_perc: 100,
      e_value: 0.001,
      bit_score: 20,
      submatch_no: 0,
    },
  ],
};

const defaultProps = {
  csrfToken: "test-csrf",
  onSetError: jest.fn(),
};

function renderBlastResults(props = {}) {
  return renderWithRouter(<BlastResults {...defaultProps} {...props} />, {
    route: "/sequencing/1",
    path: "/sequencing/:recordId",
  });
}

describe("BlastResults", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  it("renders BLAST query type radio and filter parameters", async () => {
    mockFetch({ "/sequencingrun/1/blast/": blastResponse });
    renderBlastResults();

    await waitFor(() => {
      expect(screen.getByText("BLAST query type")).toBeInTheDocument();
    });
    expect(screen.getByText("CDR3")).toBeInTheDocument();
    expect(screen.getByText("Full Sequence")).toBeInTheDocument();
    expect(screen.getByText("BLAST filter parameters")).toBeInTheDocument();
  });

  it("renders blast results table with hits", async () => {
    mockFetch({ "/sequencingrun/1/blast/": blastResponse });
    renderBlastResults();

    await waitFor(() => {
      expect(screen.getByText("Align. length")).toBeInTheDocument();
    });
    expect(screen.getByText("AACDR3")).toBeInTheDocument();
  });

  it("shows No results for empty hits", async () => {
    mockFetch({ "/sequencingrun/1/blast/": { hits: [] } });
    renderBlastResults();

    await waitFor(() => {
      expect(screen.getByText("No results")).toBeInTheDocument();
    });
  });

  it("clears loading state when fetch throws (regression)", async () => {
    const Sentry = require("@sentry/browser");
    const onSetError = jest.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = jest.fn(() => Promise.reject(networkError));
    renderBlastResults({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
    // Loading should be cleared — LoadingLlama should no longer be present
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("calls onSetError on HTTP error", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/sequencingrun/1/blast/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderBlastResults({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[BR] HTTP code 500");
    });
  });
});
