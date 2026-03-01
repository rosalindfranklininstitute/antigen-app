import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OkCancelDialog } from "./OkCancelDialog";

const defaultProps = {
  open: true,
  setOpen: jest.fn(),
  dialogTitle: "Confirm deletion",
  dialogMessage: "Are you sure you want to delete this item?",
  okAction: jest.fn(),
  locked: false,
};

const renderDialog = (overrides = {}) =>
  render(<OkCancelDialog {...defaultProps} {...overrides} />);

describe("OkCancelDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and message", () => {
    renderDialog();
    expect(screen.getByText("Confirm deletion")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this item?"),
    ).toBeInTheDocument();
  });

  it("renders default OK and Cancel labels", () => {
    renderDialog();
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    renderDialog({ okLabel: "Delete", cancelLabel: "Keep" });
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("calls okAction when OK is clicked", async () => {
    const okAction = jest.fn();
    renderDialog({ okAction });

    await userEvent.click(screen.getByText("OK"));
    expect(okAction).toHaveBeenCalledTimes(1);
  });

  it("calls setOpen(false) when Cancel is clicked", async () => {
    const setOpen = jest.fn();
    renderDialog({ setOpen });

    await userEvent.click(screen.getByText("Cancel"));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("calls cancelAction when Cancel is clicked if provided", async () => {
    const cancelAction = jest.fn();
    const setOpen = jest.fn();
    renderDialog({ cancelAction, setOpen });

    await userEvent.click(screen.getByText("Cancel"));
    expect(cancelAction).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("disables buttons when locked", () => {
    renderDialog({ locked: true });
    expect(screen.getByText("OK")).toBeDisabled();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });

  it("does not render when open is false", () => {
    renderDialog({ open: false });
    expect(screen.queryByText("Confirm deletion")).not.toBeInTheDocument();
  });
});
