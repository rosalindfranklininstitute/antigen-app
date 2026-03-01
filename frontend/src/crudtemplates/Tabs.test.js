import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabs from "./Tabs";

const TabContent = ({ tabName, children }) => <div>{children}</div>;

describe("Tabs", () => {
  it("renders tab buttons from children", () => {
    render(
      <Tabs>
        <TabContent tabName="Tab A">Content A</TabContent>
        <TabContent tabName="Tab B">Content B</TabContent>
      </Tabs>,
    );

    expect(screen.getByRole("button", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tab B" })).toBeInTheDocument();
  });

  it("shows first tab content by default", () => {
    render(
      <Tabs>
        <TabContent tabName="Tab A">Content A</TabContent>
        <TabContent tabName="Tab B">Content B</TabContent>
      </Tabs>,
    );

    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("shows clicked tab content and hides others", async () => {
    render(
      <Tabs>
        <TabContent tabName="Tab A">Content A</TabContent>
        <TabContent tabName="Tab B">Content B</TabContent>
      </Tabs>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Tab B" }));

    expect(screen.getByText("Content B")).toBeInTheDocument();
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("renders mobile select dropdown with tab options", () => {
    render(
      <Tabs>
        <TabContent tabName="Tab A">Content A</TabContent>
        <TabContent tabName="Tab B">Content B</TabContent>
      </Tabs>,
    );

    const select = screen.getByRole("combobox", { name: "Select a tab" });
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Tab A");
    expect(options[1]).toHaveTextContent("Tab B");
  });

  it("marks active tab button with aria-current", () => {
    render(
      <Tabs>
        <TabContent tabName="Tab A">Content A</TabContent>
        <TabContent tabName="Tab B">Content B</TabContent>
      </Tabs>,
    );

    expect(screen.getByRole("button", { name: "Tab A" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Tab B" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
