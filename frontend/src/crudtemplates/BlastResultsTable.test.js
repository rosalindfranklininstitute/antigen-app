import React from "react";
import { render, screen } from "@testing-library/react";
import BlastResultsTable from "./BlastResultsTable";

const makeHit = (overrides = {}) => ({
  query_title: "Query_1",
  subject_title: "Subject_1",
  query_seq: "ACGT",
  midline: "||||",
  subject_seq: "ACGT",
  query_cdr3: "CDR3SEQ",
  align_len: 100,
  align_perc: 95,
  e_value: "1e-10",
  bit_score: 200,
  submatch_no: 1,
  ...overrides,
});

describe("BlastResultsTable", () => {
  it("renders alignment, e-value, and bit score columns", () => {
    const hits = [makeHit()];
    render(
      <BlastResultsTable
        blastResults={{ hits }}
        isLoading={false}
        showCDR3col={false}
      />,
    );

    expect(screen.getByText("Align. length")).toBeInTheDocument();
    expect(screen.getByText("Alignment")).toBeInTheDocument();
    expect(screen.getByText("e-value")).toBeInTheDocument();
    expect(screen.getByText("Bit score")).toBeInTheDocument();
    expect(screen.getByText("100 (95%)")).toBeInTheDocument();
    expect(screen.getByText("1e-10")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("shows Query CDR3 column when showCDR3col is true", () => {
    const hits = [makeHit()];
    render(
      <BlastResultsTable
        blastResults={{ hits }}
        isLoading={false}
        showCDR3col={true}
      />,
    );

    expect(screen.getByText("Query CDR3")).toBeInTheDocument();
    expect(screen.getByText("CDR3SEQ")).toBeInTheDocument();
  });

  it("hides Query CDR3 column when showCDR3col is false", () => {
    const hits = [makeHit()];
    render(
      <BlastResultsTable
        blastResults={{ hits }}
        isLoading={false}
        showCDR3col={false}
      />,
    );

    expect(screen.queryByText("Query CDR3")).not.toBeInTheDocument();
  });

  it("renders 'No results' when hits array is empty", () => {
    render(
      <BlastResultsTable
        blastResults={{ hits: [] }}
        isLoading={false}
        showCDR3col={false}
      />,
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders LoadingLlama when isLoading is true", () => {
    render(
      <BlastResultsTable
        blastResults={null}
        isLoading={true}
        showCDR3col={false}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders alignment formatting with query and subject sequences", () => {
    const hits = [makeHit({ query_title: "Q1", subject_title: "S1" })];
    render(
      <BlastResultsTable
        blastResults={{ hits }}
        isLoading={false}
        showCDR3col={false}
      />,
    );

    expect(
      screen.getByText((_, element) => {
        return (
          element.tagName.toLowerCase() === "pre" &&
          element.textContent.includes("Q1") &&
          element.textContent.includes("S1") &&
          element.textContent.includes("ACGT")
        );
      }),
    ).toBeInTheDocument();
  });
});
