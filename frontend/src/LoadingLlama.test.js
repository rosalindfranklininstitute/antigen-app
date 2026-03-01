import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingLlama from "./LoadingLlama";

describe("LoadingLlama", () => {
  it("renders with a status role", () => {
    render(<LoadingLlama />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has a screen-reader loading label", () => {
    render(<LoadingLlama />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the llama image with alt text", () => {
    render(<LoadingLlama />);
    expect(
      screen.getByAltText("AntigenApp loading indicator"),
    ).toBeInTheDocument();
  });
});
