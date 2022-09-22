/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import AddProjectView from "../src/project/add";
import ProjectsView from "../src/project/aggregate";
import ProjectView from "../src/project/individual";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const fetchMock = require("fetch-mock-jest");

// mocking UseNavigate for navigating after changing the project
const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockUseNavigate,
  useParams: jest.fn().mockReturnValue({ project: "test", number: "1" }),
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
    .get("/api/project/test/?format=json", {
      status: 200,
      body: {
        short_title: "test",
        title: "test",
        description: "test",
      },
    })
);
afterAll(() => fetchMock.reset());

describe("Tests for project views ", () => {
  test("Creating a new project", async () => {
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

  test("Viewing aggregate projects", async () => {
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

  test("Viewing individual project", async () => {
    renderWithProviders(<ProjectView />)
    // work needs to be done here test individual project view
  })
});
