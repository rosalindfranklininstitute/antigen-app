/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container } from "@mui/material";
import { Header } from "../src/main/header";
import { HomeView } from "../src/main/home";
import ElisaPlateView from "../src/elisa_plate/individual";
import AddElisaPlateView from "../src/elisa_plate/add";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

const fetchMock = require("fetch-mock-jest");

// Mock useParams to get project and number from url
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ project: "test", number: "1" }),
}));

beforeAll(() => {
  fetchMock
    .post("/api/elisa_plate/", {
      project: "test",
      number: "1",
      threshold: "0",
      elisawell_set: [],
      creation_time: "2022-09-05T14:44:41.025379Z",
    })
    .get("/api/project/?format=json", [
      { short_title: "test", title: "test", description: "test" },
    ])
    .get("/api/elisa_plate/test:1/?format=json", {
      project: "test",
      number: 1,
      threhold: 0,
      elisawell_set: [],
      creation_time: "2022-09-05T14:44:41.025379Z",
    })
    .get("/api/antigen/?project=test&plate=1&format=json", [])
    .get("/api/nanobody/?project=test&plate=1&format=json", [])
    .get("/api/elisa_well/?project=test&plate=1&format=json", [])

    .get("/api/antigen/?project=test&format=json", [{
      project: "test",
      number: 1,
      name: "5a0f1822",
      sequence: "AAAAAAAAAAAAAAAAA",
      molecular_mass: 1,
      uniprot_accession_number: null,
      elisawell_set: [],
      creation_time: "2022-09-01T08:38:16.555199Z"
    }])
    .get("/api/nanobody/?project=test&format=json", [{
      project: "test",
      number: 1,
      name: "6b6d9017",
      elisawell_set: [],
      sequence_set: [],
      creation_time: "2022-09-05T08:24:17.043847Z",
    },
    ])
});

afterAll(() => {
  fetchMock.reset();
});

describe("Create new elisa plate and populating it ", () => {
  test("Create elisa plate from Home view ", async () => {
    act(() => {
      renderWithProviders(
        <BrowserRouter>
          <Header />
          <Container sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/elisa_plate/add/" element={<AddElisaPlateView />} />
              <Route path="/elisa_plate/test:1/" element={<ElisaPlateView />} />
            </Routes>
          </Container>
        </BrowserRouter>
      );
    });

    // Fill out project combobox
    userEvent.click(screen.getByRole("combobox", { name: "Project" }));
    userEvent.click(await screen.findByRole("option", { name: "test" }));

    await act(async () => {
      userEvent.click(screen.getByTestId("elisa_plate_link"));
      await screen.findByRole("heading", { name: "test:1" });
    });

    // Check the elisa plate map view 
    expect(screen.getByRole("tab", { name: "Map" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Table" })).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "Map" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Upload CSV" })).toBeTruthy()
    expect(screen.getByRole("spinbutton", { name: "Threshold" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "" })).toBeTruthy();

    const wellButtonArray = screen.getAllByRole("button", { name: "" });
    expect(wellButtonArray.length).toBe(96);

    // Navigate to tab view
    userEvent.click(screen.getByRole("tab", { name: "Table" }));
    expect(screen.getByRole("tabpanel", { name: "Table" })).toBeTruthy();
    expect(screen.getAllByRole("table")).toBeTruthy();
    expect(screen.getByRole("row", { name: "Project: test" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Number: 1" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Elisa Wells:" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Threshold:" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Creation Time: 2022-09-05T14:44:41.025379Z" })).toBeTruthy()
  });
});

