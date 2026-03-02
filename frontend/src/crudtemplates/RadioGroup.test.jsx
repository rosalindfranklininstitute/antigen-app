import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WrappedRadioGroup from "./RadioGroup";

const options = [
  { name: "Option A", disabled: false },
  { name: "Option B", disabled: false },
  { name: "Option C", disabled: true },
];

describe("WrappedRadioGroup", () => {
  it("renders the label and all option names", () => {
    render(
      <WrappedRadioGroup
        label="Test Label"
        value={options[0]}
        setValue={vi.fn()}
        options={options}
      />,
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("renders the fieldset with an accessible label", () => {
    render(
      <WrappedRadioGroup
        label="Color"
        value={options[0]}
        setValue={vi.fn()}
        options={options}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Choose a Color" }),
    ).toBeInTheDocument();
  });

  it("applies disabled styling to disabled options", () => {
    render(
      <WrappedRadioGroup
        label="Test"
        value={options[0]}
        setValue={vi.fn()}
        options={options}
      />,
    );

    const disabledOption = screen.getByRole("radio", { name: "Option C" });
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  });

  it("calls setValue when an enabled option is clicked", async () => {
    const setValue = vi.fn();
    render(
      <WrappedRadioGroup
        label="Test"
        value={options[0]}
        setValue={setValue}
        options={options}
      />,
    );

    await userEvent.click(screen.getByText("Option B"));
    expect(setValue).toHaveBeenCalledWith(options[1]);
  });
});
