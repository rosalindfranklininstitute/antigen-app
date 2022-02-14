import { Nanobody } from "./utils";
import { getAPI, postAPI } from "../utils/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { addUniqueUUID } from "../utils/state_management";

type NanobodyState = {
    nanobodies: Nanobody[]
    posted: string[]
    loading: boolean
    error: string | null
}

const initialNanobodyState: NanobodyState = {
    nanobodies: [],
    posted: [],
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
        getSuccess: (state, action: PayloadAction<Nanobody[]>) => ({
            ...state,
            loading: false,
            nanobodies: addUniqueUUID(state.nanobodies, action.payload)
        }),
        postSuccess: (state, action: PayloadAction<Nanobody>) => ({
            ...state,
            loading: false,
            nanobodies: addUniqueUUID(state.nanobodies, [action.payload]),
            posted: state.posted.concat(action.payload.uuid),
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
    getSuccess: nanobodyActionGetSucess,
    postSuccess: nanobodyActionPostSuccess,
    fail: nanobodyActionFail
} = nanobodySlice.actions

export const nanobodyReducer = nanobodySlice.reducer;

export const nanobodySelector = (state: RootState) => state.nanobodies;

export const getNanobodies = () => {
    return async (dispatch: DispatchType) => {
        dispatch(nanobodyActionPending());
        getAPI<Nanobody[]>(`nanobody`).then(
            (nanobodies) => dispatch(nanobodyActionGetSucess(nanobodies)),
            (reason) => dispatch(nanobodyActionFail(reason)),
        );
    }
}

export const getNanobody = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => { nanobodies: NanobodyState }) => {
        const state = getState();
        if (state.nanobodies.nanobodies.find((nanobody) => nanobody.uuid === uuid)) return;
        dispatch(nanobodyActionPending());
        getAPI<Nanobody>(`nanobody/${uuid}`).then(
            (nanobody) => dispatch(nanobodyActionGetSucess([nanobody])),
            (reason) => dispatch(nanobodyActionFail(reason))
        )
    }
}

export const postNanobody = () => {
    return async (dispatch: DispatchType) => {
        dispatch(nanobodyActionPending());
        postAPI<Nanobody>(`nanobody`, {}).then(
            (nanobody) => dispatch(nanobodyActionPostSuccess(nanobody)),
            (reason) => dispatch(nanobodyActionFail(reason)),
        )
    }
}
