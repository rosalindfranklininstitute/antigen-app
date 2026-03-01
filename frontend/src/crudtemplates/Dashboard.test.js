import React from "react";
import { screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { mockFetch, renderWithRouter } from "../testutils";

jest.mock("@sentry/browser", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

const statsResponse = {
  stats: [
    { name: "Projects", value: 5 },
    { name: "Antigens", value: 12 },
    { name: "Llamas", value: 3 },
    { name: "Sequencing Runs", value: 7 },
    { name: "Named Nanobodies", value: 42 },
  ],
};

const latestResponse = {
  logs: [
    {
      pk: 1,
      user: { username: "alice", email: "alice@example.com" },
      object: {
        type: "project",
        name: "Test Project",
        operation: "create",
        link: { schema: "project", id: 10 },
      },
      dateTime: "2024-01-15T10:00:00Z",
      date: "15 Jan 2024",
    },
    {
      pk: 2,
      user: { username: "bob", email: "bob@example.com" },
      object: {
        type: "antigen",
        name: "Spike",
        operation: "update",
        link: { schema: "antigen", id: 20 },
      },
      dateTime: "2024-01-14T09:00:00Z",
      date: "14 Jan 2024",
    },
  ],
};

const defaultProps = {
  csrfToken: "test-csrf",
  onSetError: jest.fn(),
};

function renderDashboard(props = {}) {
  return renderWithRouter(<Dashboard {...defaultProps} {...props} />, {
    route: "/",
  });
}

describe("Dashboard", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  it("renders stat values from the API", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders stat names", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Projects")).toBeInTheDocument();
    });
    expect(screen.getByText("Antigens")).toBeInTheDocument();
    expect(screen.getByText("Llamas")).toBeInTheDocument();
    expect(screen.getByText("Sequencing Runs")).toBeInTheDocument();
    expect(screen.getByText("Named Nanobodies")).toBeInTheDocument();
  });

  it("renders recent activity items", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("alice (alice@example.com)")).toBeInTheDocument();
    });
    expect(screen.getByText("bob (bob@example.com)")).toBeInTheDocument();
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Spike")).toBeInTheDocument();
  });

  it("renders activity operation badges", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("create")).toBeInTheDocument();
    });
    expect(screen.getByText("update")).toBeInTheDocument();
  });

  it("renders activity links to correct URLs", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });
    const projectLink = screen.getByRole("link", { name: "Test Project" });
    expect(projectLink).toHaveAttribute("href", "/projects/10");

    const antigenLink = screen.getByRole("link", { name: "Spike" });
    expect(antigenLink).toHaveAttribute("href", "/antigens/20");
  });

  it("renders the Recent edits heading", async () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Recent edits")).toBeInTheDocument();
    });
  });

  it("renders the download project report button", () => {
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": latestResponse,
    });

    renderDashboard();

    expect(
      screen.getByText("Download Project Report (.csv)"),
    ).toBeInTheDocument();
  });

  it("calls onSetError when stats fetch returns HTTP error", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/dashboard/stats": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
      "/dashboard/latest": latestResponse,
    });

    renderDashboard({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[DS] HTTP code 500");
    });
  });

  it("calls onSetError when latest fetch returns HTTP error", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderDashboard({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[DL] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry when fetch throws", async () => {
    const Sentry = require("@sentry/browser");
    const onSetError = jest.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = jest.fn(() => Promise.reject(networkError));

    renderDashboard({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });

  it("renders activity items with null link id as plain text", async () => {
    const logsWithNullLink = {
      logs: [
        {
          pk: 3,
          user: { username: "carol", email: "carol@example.com" },
          object: {
            type: "project",
            name: "Deleted Project",
            operation: "delete",
            link: { schema: "project", id: null },
          },
          dateTime: "2024-01-13T08:00:00Z",
          date: "13 Jan 2024",
        },
      ],
    };

    mockFetch({
      "/dashboard/stats": statsResponse,
      "/dashboard/latest": logsWithNullLink,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Deleted Project")).toBeInTheDocument();
    });
    // Should not be a link since id is null
    expect(
      screen.queryByRole("link", { name: "Deleted Project" }),
    ).not.toBeInTheDocument();
  });
});
