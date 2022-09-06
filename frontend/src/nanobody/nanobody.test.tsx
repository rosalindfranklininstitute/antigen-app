/** @jest-environment jsdom */
import React from "react";
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import AddNanobodyView from "./add";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NanobodiesView from "./aggregate";
const fetchMock = require("fetch-mock-jest");

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
    .get("/api/nanobody/test:1/?format=json", [
      {
        project: "test",
        number: 1,
        name: "6b6d9017",
        elisawell_set: [],
        sequence_set: [],
        creation_time: "2022-09-05T08:24:17.043847Z",
      },
    ]);
});
afterAll(() => fetchMock.reset());

describe("Nanobody adding", () => {
  test("Adding a new nanobody", async () => {
    renderWithProviders(<AddNanobodyView />);
    await waitFor(() => expect(fetchMock.called()).toBe(true));
    userEvent.click(screen.getByRole("combobox", { name: "Project" }));
    userEvent.click(await screen.findByRole("option", { name: "test" }));

    // Submit new local antigen
    userEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Check nanobody button and table was created
    userEvent.click(await screen.findByRole("button", { name: "6b6d9017" }));
    expect(screen.getAllByRole("table")).toBeTruthy();
  });

  test(" Viewing the nanobody list screen", async () => {
    // Use in memory router to allow useHref() to work
    renderWithProviders(
      <MemoryRouter>
        <NanobodiesView />
      </MemoryRouter>
    );
    // Check to see if page loaded and grid and cell for antigen exists
    // expect(await screen.findAllByRole('cell')).toBeTruthy();
    // expect(screen.getByRole('cell', { name: "6b6d9017" })).toBeTruthy()
  });
});
