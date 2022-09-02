/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import AddLocalAntigenView from "./addLocal";
import userEvent from "@testing-library/user-event";

const fetchMock = require("fetch-mock-jest");

// Create mock of the api calls needed
beforeAll(() =>
    // Create mock of the api calls needed
    fetchMock
        .post("/api/local_antigen/", {
            status: 201,
            body: {
                project: " test",
                number: "1",
                name: "5a0f1822",
                sequence: "AAAAAAAAAAAAAAA",
                molecular_mass: "1",
                creation_time: "2022-09-01T08:38:16.555199Z",
            },
        })
        .get("/api/project/?format=json",
            [{ "short_title": "test", "title": "test", "description": "test" }]
        )
        .get("/api/antigen/%20test:1/?format=json", {
            status: 200,
            body: {
                project: " test",
                number: "1",
                name: "5a0f1822",
                sequence: "AAAAAAAAAAAAAAA",
                molecular_mass: "1",
                uniprot_accession_number: null,
                elisawell_set: [],
                creation_time: "2022-09-01T08:38:16.555199Z",
            },
        })
);
afterEach(() => fetchMock.reset());

describe("test adding a new antigens", () => {
    test("Adding a local antigen", async () => {
        // render add antigen view
        renderWithProviders(<AddLocalAntigenView />);

        // Await api requests
        await waitFor(() => expect(fetchMock.called()).toBe(true));

        // Fill in boxes to add local antigen 
        userEvent.click(screen.getByRole("combobox", { name: "Project" }));
        userEvent.click(screen.getByRole("option", { name: "test" }))
        userEvent.type(
            screen.getByRole("textbox", { name: "Sequence" }),
            "AAAAAAAAAAAAAAAAA"
        );
        userEvent.type(
            screen.getByRole("spinbutton", { name: "Molecular Mass" }),
            "1"
        );
        // Submit new local antigen
        userEvent.click(screen.getByRole("button", { name: "Submit" }));

        // Await post api requests 
        await waitFor(() => expect(fetchMock.calls().length).toBeGreaterThanOrEqual(2))

        // Check if new antigen button and table is was created
        userEvent.click(screen.getByRole('button', { name: "5a0f1822" }))
        expect(screen.getAllByRole('table')).toBeTruthy()

    });
});
