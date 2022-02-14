import { configureStore } from "@reduxjs/toolkit";
import { nanobodyReducer } from "./nanobody/slice";

export const store = configureStore({
    reducer: {
        nanobodies: nanobodyReducer
    },
})

export type RootState = ReturnType<typeof store.getState>;

export type DispatchType = typeof store.dispatch;
