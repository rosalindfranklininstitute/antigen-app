import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComboBox from "./ComboBox";

// Headless UI v2 uses ResizeObserver internally
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const options = [
  { id: 1, name: "Alpha" },
  { id: 2, name: "Beta" },
  { id: 3, name: "Gamma" },
];

describe("ComboBox", () => {
  it("renders with the display value of selected option", () => {
    render(
      <ComboBox
        field="test"
        options={options}
        selected={1}
        displayField="name"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Alpha");
  });

  it("renders display value for multiple selected options", () => {
    render(
      <ComboBox
        field="test"
        options={options}
        selected={[1, 3]}
        displayField="name"
        onChange={vi.fn()}
        multiple={true}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Alpha, Gamma");
  });

  it("filters options when typing", async () => {
    render(
      <ComboBox
        field="test"
        options={options}
        selected={null}
        displayField="name"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "Bet");

    // Beta should be in the filtered list, Alpha and Gamma should not
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  });

  it("shows all options when dropdown is opened", async () => {
    render(
      <ComboBox
        field="test"
        options={options}
        selected={null}
        displayField="name"
        onChange={vi.fn()}
      />,
    );

    // Click the button to open the dropdown
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", async () => {
    const onChange = vi.fn();
    render(
      <ComboBox
        field="test"
        options={options}
        selected={null}
        displayField="name"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("Beta"));

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
