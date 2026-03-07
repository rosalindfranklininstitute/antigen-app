import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewObjectPage from "./ViewObjectPage";
import { mockFetch, renderWithRouter } from "../testutils";
import schemas from "../schema";
import * as Sentry from "@sentry/browser";

vi.mock("@sentry/browser", () => ({
  captureException: vi.fn(),
  init: vi.fn(),
}));

const projectRecord = {
  id: 1,
  short_title: "PROJ-A",
  title: "Alpha Project",
  description: "A test project",
  added_by: "alice",
  added_date: "2024-01-15",
};

const defaultProps = {
  schema: schemas.project,
  csrfToken: "test-csrf",
  onSetError: vi.fn(),
};

function renderViewPage(props = {}, { route, path } = {}) {
  return renderWithRouter(<ViewObjectPage {...defaultProps} {...props} />, {
    route: route || "/projects/1",
    path: path || "/projects/:recordId",
  });
}

describe("ViewObjectPage", () => {
  afterEach(() => {
    delete global.fetch;
    vi.restoreAllMocks();
  });

  it("renders field labels from schema", async () => {
    mockFetch({ "/project/1/": projectRecord });
    renderViewPage();

    await screen.findByText("Short title");
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Added by")).toBeInTheDocument();
    expect(screen.getByText("Added date")).toBeInTheDocument();
  });

  it("renders field values from API data", async () => {
    mockFetch({ "/project/1/": projectRecord });
    renderViewPage();

    await screen.findByText("PROJ-A");
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.getByText("A test project")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
  });

  it("renders the object name in heading and buttons", async () => {
    mockFetch({ "/project/1/": projectRecord });
    renderViewPage();

    await screen.findByText("Project Information");
    expect(screen.getByText("Edit project")).toBeInTheDocument();
    expect(screen.getByText("Delete project")).toBeInTheDocument();
  });

  it("renders Edit link pointing to edit URL", async () => {
    mockFetch({ "/project/1/": projectRecord });
    renderViewPage();

    await screen.findByText("Edit project");
    const editLink = screen.getByRole("link", { name: "Edit project" });
    expect(editLink).toHaveAttribute("href", "/projects/1/edit");
  });

  it("opens delete confirmation dialog when Delete button is clicked", async () => {
    mockFetch({ "/project/1/": projectRecord });
    renderViewPage();

    await screen.findByText("Delete project");

    await userEvent.click(screen.getByText("Delete project"));

    expect(
      screen.getByText("Are you sure you want to delete this project?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm Delete Project")).toBeInTheDocument();
  });

  it("calls DELETE endpoint when confirming delete", async () => {
    mockFetch({
      "/project/1/": (url, opts) => {
        if (opts && opts.method === "DELETE") {
          return Promise.resolve({
            status: 204,
            ok: true,
            json: () => Promise.resolve({}),
          });
        }
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(projectRecord),
        });
      },
    });

    renderViewPage();

    await screen.findByText("Delete project");

    // Open dialog
    await userEvent.click(screen.getByText("Delete project"));

    // Confirm delete
    await userEvent.click(screen.getByText("Delete Project"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/project/1/"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("calls onSetError when GET returns 404", async () => {
    const onSetError = vi.fn();
    mockFetch({
      "/project/1/": () =>
        Promise.resolve({
          status: 404,
          ok: false,
          json: () => Promise.resolve({ detail: "Not found" }),
        }),
    });

    renderViewPage({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("404 object not found");
    });
  });

  it("does not crash when 404 is returned for a schema with elisaPlateList fields", async () => {
    // Regression: accessing /antigens/12 (non-existent) previously threw
    // "TypeError: can't access property 'id', rec is undefined" because
    // displayFieldSingle ran against the initial [] record state after a failed fetch.
    const onSetError = vi.fn();
    mockFetch({
      "/antigen/12/": () =>
        Promise.resolve({
          status: 404,
          ok: false,
          json: () => Promise.resolve({ detail: "Not found" }),
        }),
    });

    renderViewPage(
      { schema: schemas.antigen, onSetError },
      { route: "/antigens/12", path: "/antigens/:recordId" },
    );

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("404 object not found");
    });
    // Component must remain mounted without throwing TypeError
    expect(screen.getByText("Antigen Information")).toBeInTheDocument();
  });

  it("calls onSetError when GET returns non-404 HTTP error", async () => {
    const onSetError = vi.fn();
    mockFetch({
      "/project/1/": () =>
        Promise.resolve({
          status: 500,
          ok: false,
          json: () => Promise.resolve({ detail: "Server error" }),
        }),
    });

    renderViewPage({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("[VO] HTTP code 500");
    });
  });

  it("calls onSetError and Sentry when fetch throws", async () => {
    const onSetError = vi.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = vi.fn(() => Promise.reject(networkError));
    renderViewPage({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });

  it("calls onSetError when DELETE returns error with message", async () => {
    const onSetError = vi.fn();
    mockFetch({
      "/project/1/": (url, opts) => {
        if (opts && opts.method === "DELETE") {
          return Promise.resolve({
            status: 400,
            ok: false,
            json: () =>
              Promise.resolve({ message: "Cannot delete: has children" }),
          });
        }
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(projectRecord),
        });
      },
    });

    renderViewPage({ onSetError });

    await screen.findByText("Delete project");

    await userEvent.click(screen.getByText("Delete project"));
    await userEvent.click(screen.getByText("Delete Project"));

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("Cannot delete: has children");
    });
  });
});
