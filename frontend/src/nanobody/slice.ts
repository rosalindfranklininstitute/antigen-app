import { Nanobody } from "./utils";
import { getAPI } from "../utils/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";

type NanobodyState = {
    nanobodies: Nanobody[]
    loading: boolean
    error: string | null
}

const initialNanobodyState: NanobodyState = {
    nanobodies: [],
    loading: false,
    error: null,
}

export const nanobodySlice = createSlice({
    name: "nanobody",
    initialState: initialNanobodyState,
    reducers: {
        pending: (state) => ({
            ...state,
            loading: true,
        }),
        success: (state, action: PayloadAction<Nanobody[]>) => ({
            ...state,
            loading: false,
            nanobodies: state.nanobodies.concat(
                action.payload.filter(
                    (newNanobody) => !state.nanobodies.find(
                        (oldNanobody) => newNanobody.uuid === oldNanobody.uuid)
                )
            )
        }),
        fail: (state, action: PayloadAction<string>) => ({
            ...state,
            loading: false,
            error: action.payload
        }),
    }
})

export const {
    pending: nanobodyActionPending,
    success: nanobodyActionSucess,
    fail: nanobodyActionFail
} = nanobodySlice.actions

export const nanobodyReducer = nanobodySlice.reducer;

export const nanobodySelector = (state: RootState) => state.nanobodies;

export const getNanobodies = () => {
    return async (dispatch: DispatchType) => {
        dispatch(nanobodyActionPending());
        getAPI<Nanobody[]>(`nanobody`).then(
            (nanobodies) => dispatch(nanobodyActionSucess(nanobodies)),
            (reason) => dispatch(nanobodyActionFail(reason)),
        );
    }
}

export const getNanobody = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => { nanobodies: NanobodyState }) => {
        const nanobodyState = getState();
        if (nanobodyState.nanobodies.nanobodies.find((nanobody) => nanobody.uuid === uuid)) return;
        dispatch(nanobodyActionPending());
        getAPI<Nanobody>(`nanobody/${uuid}`).then(
            (nanobody) => dispatch(nanobodyActionSucess([nanobody])),
            (reason) => dispatch(nanobodyActionFail(reason))
        )
    }
}
