import { configureStore } from "@reduxjs/toolkit";
import { antigenReducer } from "./antigen/slice";
import { elisaPlateReducer } from "./elisa_plate/slice";
import { elisaWellReducer } from "./elisa_well/slice";
import { nanobodyReducer } from "./nanobody/slice";
import { notificationsReducer } from "./utils/notifications";

export const store = configureStore({
  reducer: {
    nanobodies: nanobodyReducer,
    antigens: antigenReducer,
    elisaWells: elisaWellReducer,
    elisaPlates: elisaPlateReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type DispatchType = typeof store.dispatch;
