import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorHandler from "./ErrorHandler";

describe("ErrorHandler", () => {
  it("renders the error message", () => {
    render(<ErrorHandler error="Something went wrong" onSetError={() => {}} />);
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("prefixes with 'Error:'", () => {
    render(<ErrorHandler error="Network failure" onSetError={() => {}} />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it("calls onSetError with null when dismissed", async () => {
    const onSetError = vi.fn();
    render(<ErrorHandler error="fail" onSetError={onSetError} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onSetError).toHaveBeenCalledWith(null);
  });

  it("has a screen-reader-only dismiss label", () => {
    render(<ErrorHandler error="fail" onSetError={() => {}} />);
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });
});
