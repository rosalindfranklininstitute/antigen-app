/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import AddProjectView from "./add";
import ProjectsView from "./aggregate";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as router from "react-router";

const fetchMock = require("fetch-mock-jest");

// mocking UseNavigate for navigating after changing the project
const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockUseNavigate,
}));

beforeAll(() =>
  // Mock required api calls and responses
  fetchMock
    .post("/api/project/", {
      status: 201,
      body: {
        short_title: "test",
        title: "response",
        description: "description",
      },
    })
    .get("/api/project/?format=json", {
      status: 200,
      body: [
        {
          short_title: "test",
          title: "test",
          description: "test",
        },
      ],
    })
);
afterAll(() => fetchMock.reset());

describe("add projects page", () => {
  test("Creates a new project", async () => {
    // Render and project view
    renderWithProviders(<AddProjectView />);

    userEvent.type(screen.getByRole("textbox", { name: "Short Title" }), "red");
    userEvent.type(screen.getByRole("textbox", { name: "Title" }), "blue");
    userEvent.type(
      screen.getByRole("textbox", { name: "Description" }),
      "green"
    );
    // Click submit button and check api was called
    userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(fetchMock.called("/api/project/")).toBe(true);

    // Check if use navigate was called for redirect
    await waitFor(() => expect(mockUseNavigate).toHaveBeenCalled());
  });

  test("viewing project list page", async () => {
    // Use in memory router to allow useHref() to work
    renderWithProviders(
      <MemoryRouter>
        <ProjectsView />
      </MemoryRouter>
    );
    // Check to see if page loaded and grid and cell for project exists
    expect(await screen.findAllByRole("grid")).toBeTruthy();
    expect(screen.getAllByRole("cell", { name: "test" })).toBeTruthy();
  });
});
