import React from "react";
import { screen, waitFor } from "@testing-library/react";
import SequencingResults from "./SequencingResults";
import { mockFetch, renderWithRouter } from "../testutils";

jest.mock("@sentry/browser", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

const resultsData = {
  records: [
    {
      sequence_id: "SEQ001",
      nanobody_autoname: "Nb-001",
      productive: "Y",
      stop_codon: "N",
      fwr1_aa: "FWR1SEQ",
      cdr1_aa: "CDR1SEQ",
      fwr2_aa: "FWR2SEQ",
      cdr2_aa: "CDR2SEQ",
      fwr3_aa: "FWR3SEQ",
      cdr3_aa: "CDR3SEQ",
      sequence: "FULLSEQUENCE",
      new_cdr3: false,
      nanobody: null,
    },
  ],
};

const defaultProps = {
  csrfToken: "test-csrf",
  onSetError: jest.fn(),
};

function renderSeqResults(props = {}) {
  return renderWithRouter(<SequencingResults {...defaultProps} {...props} />, {
    route: "/sequencing/5/results",
    path: "/sequencing/:recordId/results",
  });
}

describe("SequencingResults", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  it("renders all 11 column headers", async () => {
    mockFetch({ "/sequencingrun/5/results/": resultsData });
    renderSeqResults();

    await waitFor(() => {
      expect(screen.getByText("Sequence ID")).toBeInTheDocument();
    });
    expect(screen.getByText("Nb autoname")).toBeInTheDocument();
    expect(screen.getByText("Productive (Y/N)")).toBeInTheDocument();
    expect(screen.getByText("Stop Codon (Y/N)")).toBeInTheDocument();
    expect(screen.getByText("FWR1")).toBeInTheDocument();
    expect(screen.getByText("CDR1")).toBeInTheDocument();
    expect(screen.getByText("FWR2")).toBeInTheDocument();
    expect(screen.getByText("CDR2")).toBeInTheDocument();
    expect(screen.getByText("FWR3")).toBeInTheDocument();
    expect(screen.getByText("CDR3")).toBeInTheDocument();
    expect(screen.getByText("Sequence")).toBeInTheDocument();
  });

  it("renders result rows with data", async () => {
    mockFetch({ "/sequencingrun/5/results/": resultsData });
    renderSeqResults();

    await waitFor(() => {
      expect(screen.getByText("SEQ001")).toBeInTheDocument();
    });
    expect(screen.getByText("Nb-001")).toBeInTheDocument();
    expect(screen.getByText("CDR3SEQ")).toBeInTheDocument();
    expect(screen.getByText("FULLSEQUENCE")).toBeInTheDocument();
  });

  it("renders 'No results' when records array is empty", async () => {
    mockFetch({ "/sequencingrun/5/results/": { records: [] } });
    renderSeqResults();

    await waitFor(() => {
      expect(screen.getByText("No results")).toBeInTheDocument();
    });
  });

  it("renders LoadingLlama before data loads", () => {
    // Don't set up fetch so data never arrives
    global.fetch = jest.fn(() => new Promise(() => {}));
    renderSeqResults();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls onSetError when HTTP error occurs", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/sequencingrun/5/results/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderSeqResults({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[SR] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry on network error", async () => {
    const Sentry = require("@sentry/browser");
    const onSetError = jest.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = jest.fn(() => Promise.reject(networkError));
    renderSeqResults({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });
});
