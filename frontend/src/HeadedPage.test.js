import React from "react";
import { render, screen } from "@testing-library/react";
import HeadedPage from "./HeadedPage";

describe("HeadedPage", () => {
  it("renders the title as a heading", () => {
    render(<HeadedPage title="Antigens" />);
    expect(
      screen.getByRole("heading", { name: "Antigens" }),
    ).toBeInTheDocument();
  });

  it("sets the document title", () => {
    render(<HeadedPage title="Libraries" />);
    expect(document.title).toBe("Libraries | AntigenApp");
  });

  it("renders children", () => {
    render(
      <HeadedPage title="Test">
        <p>Child content</p>
      </HeadedPage>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("shows environment badge when not production", () => {
    window._environment = "staging";
    render(<HeadedPage title="Test" />);
    expect(screen.getByText("STAGING ENVIRONMENT")).toBeInTheDocument();
    delete window._environment;
  });

  it("does not show environment badge in production", () => {
    window._environment = "production";
    render(<HeadedPage title="Test" />);
    expect(screen.queryByText(/ENVIRONMENT/)).not.toBeInTheDocument();
    delete window._environment;
  });
});
