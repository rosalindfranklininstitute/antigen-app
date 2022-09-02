/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import { MemoryRouter as Router } from 'react-router-dom'
import AddProjectView from "./add";
import ProjectsView from "./aggregate";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

const fetchMock = require("fetch-mock-jest");

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
                }
            ],
        })
);
afterAll(() => fetchMock.reset());

describe("add projects page", () => {
    test("Creates a new project", async () => {
        // Render and project view 
        renderWithProviders(
            <Router>
                <AddProjectView />
            </Router>);
        // Type in details of new textbox
        userEvent.type(screen.getByRole("textbox", { name: "Short Title" }), "red");
        userEvent.type(screen.getByRole("textbox", { name: "Title" }), "blue");
        userEvent.type(
            screen.getByRole("textbox", { name: "Description" }),
            "green"
        );
        act(() => {
            // Click submit button and check api was called 
            userEvent.click(screen.getByRole("button", { name: "Submit" }));
        });
        expect(fetchMock.called("/api/project/")).toBe(true);

    });

    test("viewing project list page", async () => {
        renderWithProviders(
            <Router>
                <ProjectsView />
            </Router>);
        await waitFor(() => expect(fetchMock.called()).toBe(true));
        // Check to see if page loaded and grid exists
        expect(screen.getAllByRole('grid')).toBeTruthy();
    });
});
