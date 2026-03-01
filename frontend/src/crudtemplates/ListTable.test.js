import React from "react";
import { screen, waitFor } from "@testing-library/react";
import ListTable from "./ListTable";
import { mockFetch, renderWithRouter } from "../testutils";
import schemas from "../schema";

jest.mock("@sentry/browser", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

const projectRecords = [
  {
    id: 1,
    short_title: "PROJ-A",
    title: "Alpha Project",
    description: "First project",
  },
  {
    id: 2,
    short_title: "PROJ-B",
    title: "Beta Project",
    description: "Second project",
  },
];

const defaultProps = {
  schema: schemas.project,
  csrfToken: "test-csrf",
  onSetError: jest.fn(),
};

function renderListTable(
  props = {},
  { route = "/projects", path = "/projects" } = {},
) {
  return renderWithRouter(<ListTable {...defaultProps} {...props} />, {
    route,
    path,
  });
}

describe("ListTable", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  it("renders table headers from schema field labels", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable();

    await waitFor(() => {
      expect(screen.getByText("Short title")).toBeInTheDocument();
    });
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders the object name as heading", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable();

    await waitFor(() => {
      expect(screen.getByText("Projects")).toBeInTheDocument();
    });
  });

  it("renders rows from API data", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable();

    await waitFor(() => {
      expect(screen.getByText("PROJ-A")).toBeInTheDocument();
    });
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.getByText("First project")).toBeInTheDocument();
    expect(screen.getByText("PROJ-B")).toBeInTheDocument();
    expect(screen.getByText("Beta Project")).toBeInTheDocument();
  });

  it("renders links to the view page for each record", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable();

    await waitFor(() => {
      expect(screen.getByText("PROJ-A")).toBeInTheDocument();
    });
    const link = screen.getByRole("link", { name: "PROJ-A" });
    expect(link).toHaveAttribute("href", "/projects/1");
  });

  it("renders Add button when not readOnly", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable();

    await waitFor(() => {
      expect(screen.getByText("Add project")).toBeInTheDocument();
    });
  });

  it("does not render Add button when readOnly", async () => {
    mockFetch({ "/project/": projectRecords });
    renderListTable({ readOnly: true });

    await waitFor(() => {
      expect(screen.getByText("PROJ-A")).toBeInTheDocument();
    });
    expect(screen.queryByText("Add project")).not.toBeInTheDocument();
  });

  it("shows empty state when no records returned", async () => {
    mockFetch({ "/project/": [] });
    renderListTable();

    await waitFor(() => {
      expect(
        screen.getByText("No projects have been created yet"),
      ).toBeInTheDocument();
    });
  });

  it("calls onSetError when fetch returns HTTP error", async () => {
    const onSetError = jest.fn();
    mockFetch({
      "/project/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderListTable({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[LT] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry when fetch throws", async () => {
    const Sentry = require("@sentry/browser");
    const onSetError = jest.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = jest.fn(() => Promise.reject(networkError));
    renderListTable({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });

  it("appends filter query param when filterField is set", async () => {
    mockFetch({ "/library/": [] });

    renderListTable(
      {
        schema: schemas.library,
        filterField: "project",
      },
      { route: "/projects/5", path: "/projects/:recordId" },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/library/?project=5"),
        expect.any(Object),
      );
    });
  });

  it("appends parentObjectName query param when no filterField", async () => {
    mockFetch({ "/library/": [] });

    renderListTable(
      { schema: schemas.library },
      { route: "/projects/5", path: "/projects/:recordId" },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/library/?project=5"),
        expect.any(Object),
      );
    });
  });
});
