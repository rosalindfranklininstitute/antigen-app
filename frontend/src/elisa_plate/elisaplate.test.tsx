/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import {
  findAllByRole,
  findByRole,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import { BrowserRouter, Navigate } from "react-router-dom";
import { Route, Routes } from "react-router";
import { Container, toggleButtonClasses } from "@mui/material";
import { Header } from "../main/header";
import { HomeView } from "../main/home";
import ElisaPlatesView from "./aggregate";
import ElisaPlateView from "./individual";
import AddElisaPlateView from "./add";
import userEvent from "@testing-library/user-event";
import { ElisaPlateInfo, ElisaPlateRef } from "./utils";
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
    .get("/elisa_plate/test:1", "hello")
    .get("/api/elisa_plate/undefined:NaN/?format=json", {
      project: "test",
      number: 1,
      threhold: 0,
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
    .get("/api/elisa_well/?project=test&plate=1&format=json", []);
});

describe("Create new elisa plate", () => {
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

    // Check to see if this is the elisa plate view
    expect(screen.getByRole("tab", { name: "Map" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Table" })).toBeTruthy();
  });
});
