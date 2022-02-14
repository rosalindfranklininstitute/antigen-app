import { configureStore } from "@reduxjs/toolkit";
import { antigenReducer } from "./antigen/slice";
import { nanobodyReducer } from "./nanobody/slice";

export const store = configureStore({
    reducer: {
        nanobodies: nanobodyReducer,
        antigens: antigenReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;

export type DispatchType = typeof store.dispatch;
