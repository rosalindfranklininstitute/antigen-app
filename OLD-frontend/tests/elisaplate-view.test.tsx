/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders, elisaWellListGenerator } from "./test-utils";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container } from "@mui/material";
import { Header } from "../src/main/header";
import { HomeView } from "../src/main/home";
import ElisaPlateView from "../src/elisa_plate/individual";
import AddElisaPlateView from "../src/elisa_plate/add";
import userEvent from "@testing-library/user-event";

const fetchMock = require("fetch-mock-jest");

// Mock useParams to get project and number from url
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ project: "test", number: "1" }),
}));

beforeAll(() => {
  fetchMock
    .get("/api/project/?format=json", [
      { short_title: "test", title: "test", description: "test" },
    ])
    .get("/api/elisa_plate/test:1/?format=json", {
      project: "test",
      number: 1,
      threhold: 0,
      elisawell_set: elisaWellListGenerator({
        project: "test",
        plate: 6,
      }),
      creation_time: "2022-09-05T14:44:41.025379Z",
    })
    .get(
      "/api/elisa_well/?project=test&plate=1&format=json",
      elisaWellListGenerator({
        project: "test",
        plate: 1,
        antigen: { project: "test", number: 1 },
        nanobody: { project: "test", number: 1 },
        optical_density: 0,
        functional: false,
      })
    )
    .get("/api/antigen/?project=test&plate=1&format=json", [
      {
        project: "test",
        number: 1,
        name: "7e63f509",
        sequence: "AAAAAAAAAAA",
        molecular_mass: 1,
        uniprot_accenssion_number: null,
        elisaWell_set: elisaWellListGenerator({
          project: "test",
          plate: 1,
        }),
        creation_time: "2022-09-06T12:18:41.090398Z",
      },
    ])
    .get("/api/nanobody/?project=test&plate=1&format=json", [
      {
        project: "test",
        number: 1,
        name: "6c10bf0c",
        elisawell_set: elisaWellListGenerator({
          project: "test",
          plate: "1",
          sequence_set: [],
          creation_time: "2022-09-09T14:35:06.741295Z",
        }),
      },
    ]);
  renderWithProviders(
    <BrowserRouter>
      <ElisaPlateView />
    </BrowserRouter>
  );
});

afterAll(() => fetchMock.reset());

describe("Tests on an existing loading an elisaplate", () => {
  test("Data recieved and working popovers", async () => {
    expect(await screen.findByRole("heading", { name: "test:1" })).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "Map" })).toBeTruthy();
    // elisawell button testid = elisawell location
    userEvent.hover(screen.getByTestId(1));
    expect(screen.getByRole("presentation", { name: "" })).toBeTruthy();
    userEvent.unhover(screen.getByTestId(1));
    fireEvent.click(screen.getByTestId(1));

    // userEvent.click triggers mouseDown but fireEvent.click does not
    expect(
      screen.getByRole("combobox", { name: "Antigen" }).getAttribute("value")
    ).toBe("7e63f509");
    expect(
      screen.getByRole("combobox", { name: "Nanobody" }).getAttribute("value")
    ).toBe("6c10bf0c");
    expect(
      screen
        .getByRole("spinbutton", { name: "Optical Density" })
        .getAttribute("value")
    ).toBe("0");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  test("Csv upload for frontend", () => {
    // work on this
    expect(1 + 1).toBe(2);
  });
});
