/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { findAllByRole, screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { BrowserRouter } from "react-router-dom";
import ElisaWellsView from "../src/elisa_well/aggregate";
import ElisaWellView from "../src/elisa_well/individual";

const fetchMock = require("fetch-mock-jest");

// Mock useParams to get project and number from url
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest
    .fn()
    .mockReturnValue({ project: "test", plate: "1", location: "1" }),
}));

beforeAll(() => {
  fetchMock
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
    .get("/api/elisa_well/?format=json", {
      status: 200,
      body: [
        {
          project: "test",
          plate: 1,
          location: 1,
          antigen: { project: "test", number: 1 },
          nanobody: { project: "test", number: 1 },
          optical_density: 0.0,
          functioal: true,
        },
      ],
    })
    .get("/api/elisa_well/test:1:1/?format=json", {
      status: 200,
      body: {
        project: "test",
        plate: 1,
        location: 1,
        antigen: { project: "test", number: 1 },
        nanobody: { project: "test", number: 1 },
        optical_density: 0.0,
        functional: false,
      },
    })
    .get("/api/antigen/test:1/?format=json", {
      project: "test",
      number: 1,
      name: "50f6339b",
      sequence: "AAAAAAAAAAAAAAAAAAAAAAAAAA",
      molecular_mass: 1,
      uniprot_accession_number: null,
      elisawell_set: [{ project: "test", plate: 1, location: 1 }],
    })
    .get("/api/nanobody/test:1/?format=json", {
      project: "test",
      number: 7,
      name: "dd4533ff",
      elisawell_set: [{ project: "test", plate: 1, location: 1 }],
      sequence_set: [],
      creation_time: "2022-09-21T13:43:48.178152Z",
    });
});

describe("Testing the Elisa well views", () => {
  test("Rendering the elisa_well agreggate view", async () => {
    renderWithProviders(
      <BrowserRouter>
        <ElisaWellsView />
      </BrowserRouter>
    );
    expect(await screen.findAllByRole("grid")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "test" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "1" })).toBeTruthy();
  });

  test("Rendering the elisawell individual view ", async () => {
    renderWithProviders(<ElisaWellView />);
    expect(await screen.findAllByRole("heading")).toBeTruthy();
    expect(screen.getByRole("row", { name: "Project: test" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Plate: 1" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Location: 1" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Antigen: test:1" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "Nanobody: test:1" })).toBeTruthy();
  });
});
