import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import type { AppStore, RootState } from "../store";

// import slice reducers
import { antigenReducer } from "../antigen/slice";
import { elisaPlateReducer } from "../elisa_plate/slice";
import { elisaWellReducer } from "../elisa_well/slice";
import { nanobodyReducer } from "../nanobody/slice";
import { projectReducer } from "../project/slice";
import { notificationsReducer } from "../utils/notifications";

interface ExtendRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    // Automatically create a store instance if no store is passed in
    store = configureStore({
      reducer: {
        projects: projectReducer,
        nanobodies: nanobodyReducer,
        antigens: antigenReducer,
        elisaWells: elisaWellReducer,
        elisaPlates: elisaPlateReducer,
        notifications: notificationsReducer,
      },
    }),
    ...renderOptions
  }: ExtendRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Creates an array of 96 well objects with incrementing location.
 * @param {object} wellInfo oject containing the  other fields of the well object
*/
export function elisaWellListGenerator<GenericWellInfo>(wellInfo: GenericWellInfo) {
  const ind = Array.from(Array(96).keys());
  return ind.map((i) => { return { ...wellInfo, location: i + 1 } });
}