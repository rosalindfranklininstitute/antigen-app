import { configureStore } from "@reduxjs/toolkit";
import { antigenReducer } from "./antigen/slice";
import { elisaPlateReducer } from "./elisa_plate/slice";
import { elisaWellReducer } from "./elisa_well/slice";
import { nanobodyReducer } from "./nanobody/slice";

export const store = configureStore({
  reducer: {
    nanobodies: nanobodyReducer,
    antigens: antigenReducer,
    elisaWells: elisaWellReducer,
    elisaPlates: elisaPlateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type DispatchType = typeof store.dispatch;
