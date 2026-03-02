import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEditObjectPage from "./AddEditObjectPage";
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

function renderAddPage(props = {}, { route, path } = {}) {
  return renderWithRouter(<AddEditObjectPage {...defaultProps} {...props} />, {
    route: route || "/projects/add",
    path: path || "/projects/add",
  });
}

function renderEditPage(props = {}, { route, path } = {}) {
  return renderWithRouter(<AddEditObjectPage {...defaultProps} {...props} />, {
    route: route || "/projects/1/edit",
    path: path || "/projects/:recordId/edit",
  });
}

describe("AddEditObjectPage", () => {
  afterEach(() => {
    delete global.fetch;
    vi.restoreAllMocks();
  });

  describe("Create mode", () => {
    it("renders form field labels from schema (non-hidden fields)", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Short title");
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("does not render fields with hideOnForm", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Short title");
      // "Added by" and "Added date" have hideOnForm: true
      expect(screen.queryByText("Added by")).not.toBeInTheDocument();
      expect(screen.queryByText("Added date")).not.toBeInTheDocument();
    });

    it("renders Save and Cancel buttons", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Save");
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("renders text input fields", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Short title");

      const textInputs = screen
        .getAllByRole("textbox")
        .filter((el) => el.tagName === "INPUT");
      expect(textInputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders textarea for description field", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Description");

      const textareas = screen
        .getAllByRole("textbox")
        .filter((el) => el.tagName === "TEXTAREA");
      expect(textareas).toHaveLength(1);
    });

    it("submits form with POST method", async () => {
      mockFetch({
        "/project/": (url, opts) => {
          if (opts && opts.method === "POST") {
            return Promise.resolve({
              status: 201,
              ok: true,
              json: () => Promise.resolve({ id: 99 }),
            });
          }
          return Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve([]),
          });
        },
      });

      renderAddPage();

      await screen.findByText("Save");

      await userEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/project/"),
          expect.objectContaining({ method: "POST" }),
        );
      });
    });

    it("displays validation errors from 400 response", async () => {
      mockFetch({
        "/project/": (url, opts) => {
          if (opts && opts.method === "POST") {
            return Promise.resolve({
              status: 400,
              ok: false,
              json: () =>
                Promise.resolve({
                  short_title: ["This field is required."],
                  non_field_errors: ["Something went wrong overall."],
                }),
            });
          }
          return Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve([]),
          });
        },
      });

      renderAddPage();

      await screen.findByText("Save");

      await userEvent.click(screen.getByText("Save"));

      await screen.findByText("Something went wrong overall.");
      expect(screen.getByText("This field is required.")).toBeInTheDocument();
    });

    it("calls onSetError on HTTP 500", async () => {
      const onSetError = vi.fn();
      mockFetch({
        "/project/": (url, opts) => {
          if (opts && opts.method === "POST") {
            return Promise.resolve({
              status: 500,
              ok: false,
              json: () => Promise.resolve({ detail: "Server error" }),
            });
          }
          return Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve([]),
          });
        },
      });

      renderAddPage({ onSetError });

      await screen.findByText("Save");

      await userEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(onSetError).toHaveBeenCalledWith(
          "[AEOP] HTTP 500 - please report this bug!",
        );
      });
    });

    it("calls onSetError and Sentry when fetch throws on submit", async () => {
      const onSetError = vi.fn();
      const networkError = new TypeError("Failed to fetch");

      // First call succeeds (initial load has no fetch for create mode with project schema)
      // Submit will fail
      global.fetch = vi.fn(() => Promise.reject(networkError));

      renderAddPage({ onSetError });

      await screen.findByText("Save");

      await userEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
    });

    it("opens cancel dialog when Cancel is clicked", async () => {
      mockFetch({});
      renderAddPage();

      await screen.findByText("Cancel");

      await userEvent.click(screen.getByText("Cancel"));

      expect(
        screen.getByText("Leave this page and discard any changes?"),
      ).toBeInTheDocument();
      // "Discard changes" appears as both dialog title and OK button
      expect(screen.getAllByText("Discard changes")).toHaveLength(2);
    });
  });

  describe("Edit mode", () => {
    it("fetches existing record and populates fields", async () => {
      mockFetch({ "/project/1/": projectRecord });
      renderEditPage();

      await screen.findByDisplayValue("PROJ-A");

      expect(screen.getByDisplayValue("Alpha Project")).toBeInTheDocument();
      expect(screen.getByDisplayValue("A test project")).toBeInTheDocument();
    });

    it("submits form with PATCH method in edit mode", async () => {
      mockFetch({
        "/project/1/": (url, opts) => {
          if (opts && opts.method === "PATCH") {
            return Promise.resolve({
              status: 200,
              ok: true,
              json: () => Promise.resolve({ id: 1 }),
            });
          }
          return Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve(projectRecord),
          });
        },
      });

      renderEditPage();

      await screen.findByDisplayValue("PROJ-A");

      await userEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/project/1/"),
          expect.objectContaining({ method: "PATCH" }),
        );
      });
    });

    it("shows 404 when record not found", async () => {
      mockFetch({
        "/project/1/": () =>
          Promise.resolve({
            status: 404,
            ok: false,
            json: () => Promise.resolve({ detail: "Not found" }),
          }),
      });

      renderEditPage();

      await screen.findByText("404 Not found");
    });

    it("enables Save when GET returns 500 after loading completes", async () => {
      mockFetch({
        "/project/1/": () =>
          Promise.resolve({
            status: 500,
            ok: false,
            json: () => Promise.resolve({ detail: "Server error" }),
          }),
      });

      renderEditPage();

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeEnabled();
      });
    });
  });

  describe("With foreign key fields (cohort schema)", () => {
    const cohortProps = {
      schema: schemas.cohort,
      csrfToken: "test-csrf",
      onSetError: vi.fn(),
    };

    it("fetches related tables for FK and selectmulti fields", async () => {
      mockFetch({
        "/llama/": [
          { id: 1, name: "Larry" },
          { id: 2, name: "Luna" },
        ],
        "/antigen/": [
          { id: 1, short_name: "Spike" },
          { id: 2, short_name: "RBD" },
        ],
      });

      renderWithRouter(<AddEditObjectPage {...cohortProps} />, {
        route: "/cohorts/add",
        path: "/cohorts/add",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/llama/"),
          expect.any(Object),
        );
      });
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/antigen/"),
          expect.any(Object),
        );
      });
    });

    it("renders field labels for cohort schema", async () => {
      mockFetch({
        "/llama/": [{ id: 1, name: "Larry" }],
        "/antigen/": [{ id: 1, short_name: "Spike" }],
      });

      renderWithRouter(<AddEditObjectPage {...cohortProps} />, {
        route: "/cohorts/add",
        path: "/cohorts/add",
      });

      await screen.findByText("Cohort no.");
      expect(screen.getByText("Llama")).toBeInTheDocument();
      expect(screen.getByText("Is Naive?")).toBeInTheDocument();
      expect(screen.getByText("Immunisation date")).toBeInTheDocument();
      expect(screen.getByText("Blood draw date")).toBeInTheDocument();
      expect(screen.getByText("Antigens")).toBeInTheDocument();
    });
  });
});
