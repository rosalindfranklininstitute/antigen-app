import React from "react";
import { screen, waitFor } from "@testing-library/react";
import AuditLog from "./AuditLog";
import { mockFetch, renderWithRouter } from "../testutils";
import * as Sentry from "@sentry/browser";

vi.mock("@sentry/browser", () => ({
  captureException: vi.fn(),
  init: vi.fn(),
}));

const auditLogData = [
  {
    object_id: 1,
    action: 0,
    actor_username: "alice",
    actor_email: "alice@example.com",
    timestamp: "2024-01-15T10:00:00Z",
    changes_dict: {
      title: [null, "New Title"],
    },
  },
  {
    object_id: 1,
    action: 1,
    actor_username: "bob",
    actor_email: "bob@example.com",
    timestamp: "2024-01-16T12:00:00Z",
    changes_dict: {
      title: ["New Title", "Updated Title"],
    },
  },
];

const defaultProps = {
  schema: { apiUrl: "/project", objectName: "project" },
  onSetError: vi.fn(),
};

function renderAuditLog(props = {}) {
  return renderWithRouter(<AuditLog {...defaultProps} {...props} />, {
    route: "/projects/1/audit",
    path: "/projects/:recordId/audit",
  });
}

describe("AuditLog", () => {
  afterEach(() => {
    delete global.fetch;
    vi.restoreAllMocks();
  });

  it("renders audit entries with actor username and email", async () => {
    mockFetch({ "/project/1/auditlog/": auditLogData });
    renderAuditLog();

    await screen.findByText(/alice/);
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/bob/)).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
  });

  it("renders action types (created/updated)", async () => {
    mockFetch({ "/project/1/auditlog/": auditLogData });
    renderAuditLog();

    await screen.findByText("created");
    expect(screen.getByText("updated")).toBeInTheDocument();
  });

  it("displays field changes (changed from X to Y)", async () => {
    mockFetch({ "/project/1/auditlog/": auditLogData });
    renderAuditLog();

    await screen.findByText("Updated Title");

    expect(
      screen.getByText((_, element) => {
        return (
          element.tagName.toLowerCase() === "p" &&
          element.textContent.includes(
            "title changed from New Title to Updated Title",
          )
        );
      }),
    ).toBeInTheDocument();
  });

  it("displays set-to values for created entries", async () => {
    mockFetch({ "/project/1/auditlog/": auditLogData });
    renderAuditLog();

    await screen.findByText("created");

    expect(
      screen.getByText((_, element) => {
        return (
          element.tagName.toLowerCase() === "p" &&
          element.textContent.includes("title set to New Title")
        );
      }),
    ).toBeInTheDocument();
  });

  it("calls onSetError on 404", async () => {
    const onSetError = vi.fn();
    mockFetch({
      "/project/1/auditlog/": () =>
        Promise.resolve({
          status: 404,
          ok: false,
          json: () => Promise.resolve({ detail: "Not found" }),
        }),
    });

    renderAuditLog({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("404 object not found");
    });
  });

  it("calls onSetError and Sentry on network error", async () => {
    const onSetError = vi.fn();
    const networkError = new TypeError("Failed to fetch");

    global.fetch = vi.fn(() => Promise.reject(networkError));
    renderAuditLog({ onSetError });

    await waitFor(() => {
      expect(onSetError).toHaveBeenCalledWith("TypeError: Failed to fetch");
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(networkError);
  });
});
