/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import AddNanobodyView from "../src/nanobody/add";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import NanobodiesView from "../src/nanobody/aggregate";
import NanobodyView from "../src/nanobody/individual";

const fetchMock = require("fetch-mock-jest");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ project: "test", number: "1" }),
}));

beforeAll(() => {
  fetchMock
    .get("/api/project/?format=json", [
      {
        short_title: "test",
        title: "test",
        description: "test",
      },
    ])
    .get("/api/nanobody/?format=json", [
      {
        project: "test",
        number: "1",
        name: "6b6d9017",
        elisawell_set: [],
        sequence_set: [],
        creation_time: "2022-09-05T14:33:53.892643Z",
      },
    ])
    .post("/api/nanobody/", [
      {
        project: "test",
        number: "1",
        name: "6b6d9017",
        elisawell_set: [],
        sequence_set: [],
        creation_time: "2022-09-05T08:24:17.043847Z",
      },
    ])
    .get("/api/nanobody/test:1/?format=json",
      {
        project: "test",
        number: 1,
        name: "6b6d9017",
        elisawell_set: [],
        sequence_set: [],
        creation_time: "2022-09-05T08:24:17.043847Z",
      },
    );
});
afterAll(() => fetchMock.reset());

describe("Tests on Nanobody views", () => {

  test("Adding a new nanobody", async () => {
    renderWithProviders(<AddNanobodyView />);
    userEvent.click(await screen.findByRole("combobox", { name: "Project" }));
    userEvent.click(await screen.findByRole("option", { name: "test" }));

    // Submit new local antigen
    userEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Check nanobody button and table was created
    userEvent.click(await screen.findByRole("button", { name: "6b6d9017" }));
    expect(screen.getAllByRole("table")).toBeTruthy();
  });

  test("Rendering the nanobody aggregate view ", async () => {
    renderWithProviders(
      <BrowserRouter>
        <NanobodiesView />
      </BrowserRouter>
    );
    // Tests needed for this aggregate view
  });

  test("Rendering the nanobody individual view", async () => {
    renderWithProviders(<NanobodyView />);
    expect(await screen.findByRole("heading", { name: "6b6d9017" })).toBeTruthy();
    expect(screen.getAllByRole("table")).toBeTruthy();
    expect(screen.getByRole("row", { name: "Project: test" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Number: 1" })).toBeTruthy()
    expect(screen.getByRole("row", { name: "Name: 6b6d9017" })).toBeTruthy()
    expect(screen.getByRole("row", {
      name: "Creation Time: 2022-09-05T08:24:17.043847Z"
    })).toBeTruthy()
  });
});
