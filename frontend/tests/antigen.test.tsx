/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { findByRole, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { MemoryRouter } from "react-router-dom";
import AddLocalAntigenView from "../src/antigen/addLocal";
import AddUniProtAntigenView from "../src/antigen/addUniprot";
import userEvent from "@testing-library/user-event";
import AntigensView from "../src/antigen/aggregate";
import AntigenView from "../src/antigen/individual";

const fetchMock = require("fetch-mock-jest");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ project: "test", number: "1" }),
}));

// Create mock of the api calls needed
beforeAll(() =>
  // Create mock of the api calls needed
  fetchMock
    .post("/api/local_antigen/", {
      status: 201,
      body: {
        project: "test",
        number: "1",
        name: "5a0f1822",
        sequence: "AAAAAAAAAAAAAAAAA",
        molecular_mass: "1",
        creation_time: "2022-09-01T08:38:16.555199Z",
      },
    })
    .post("/api/uniprot_antigen/", {
      status: 201,
      body: {
        project: "test",
        number: "1",
        uniprot_accession_number: "P12345",
      },
    })
    .get("/api/project/?format=json", [
      { short_title: "test", title: "test", description: "test" },
    ])
    .get("/api/antigen/?format=json", [
      {
        project: "test",
        number: "1",
        name: "5a0f1822",
        sequence: "AAAAAAAAAAAAAAAAA",
        molecular_mass: "1",
        uniprot_accession_number: null,
        elisawell_set: [],
        creation_time: "2022-09-06T12:18:41.090398Z",
      },
    ])
    .get("/api/antigen/test:1/?format=json", {
      project: "test",
      number: 1,
      name: "5a0f1822",
      sequence: "AAAAAAAAAAAAAAAAA",
      molecular_mass: 1,
      uniprot_accession_number: null,
      elisawell_set: [],
      creation_time: "2022-09-01T08:38:16.555199Z"
    })
    .get("/api/antigen/%20test:1/?format=json", {
      project: "test",
      number: 1,
      name: "5a0f1822",
      sequence: "AAAAAAAAAAAAAAAAA",
      molecular_mass: 1,
      uniprot_accession_number: null,
      elisawell_set: [],
      creation_time: "2022-09-01T08:38:16.555199Z",
    })
);
afterAll(() => fetchMock.reset());

describe("Tests on antigen views ", () => {
  test("Adding a local antigen", async () => {
    // render add antigen view
    renderWithProviders(<AddLocalAntigenView />);

    // Fill in boxes to add local antigen
    userEvent.click(screen.getByRole("combobox", { name: "Project" }));
    userEvent.click(await screen.findByRole("option", { name: "test" }));
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

    // Check if new antigen button and table is was created
    userEvent.click(await screen.findByRole("button", { name: "5a0f1822" }));
    expect(screen.getAllByRole("table")).toBeTruthy();
  });

  test("Adding a new UniProt antigen", async () => {
    renderWithProviders(<AddUniProtAntigenView />);
    // Fill out info boxes
    userEvent.click(screen.getByRole("combobox", { name: "Project" }));
    userEvent.click(await screen.findByRole("option", { name: "test" }));
    userEvent.type(
      screen.getByRole("textbox", { name: "UniProt Accession Number" }),
      "P12345"
    );

    // Submit new uniprot antigen
    userEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Check new antigen exits in UI
    userEvent.click(await screen.findByRole("button", { name: "5a0f1822" }));
    expect(screen.getAllByRole("table")).toBeTruthy();
  });

  test("Rendering antigen aggregate view", async () => {
    // Use in memory router to allow useHref() to work
    renderWithProviders(
      <MemoryRouter>
        <AntigensView />
      </MemoryRouter>
    );
    // Check to see if page loaded and grid and cell for antigen exists
    expect(await screen.findAllByRole("grid")).toBeTruthy();
    expect(screen.getAllByRole("cell", { name: "5a0f1822" })).toBeTruthy();
  });

  test("Rendering the antigen individual view", async () => {
    renderWithProviders(<AntigenView />)
    expect(await screen.findByRole("heading", { name: "5a0f1822" })).toBeTruthy();
    expect(await screen.findAllByRole("table")).toBeTruthy();
    expect(screen.getByRole("row", { name: "Project: test" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Number: 1" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Name: 5a0f1822" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Sequence: AAAAAAAAAAAAAAAAA" }))
    expect(screen.getByRole("row", { name: "Molecular Mass: 1" }))
    expect(screen.getByRole("row", { name: "Creation Time: 2022-09-01T08:38:16.555199Z" }))
  })
});
