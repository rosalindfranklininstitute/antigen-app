import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, filterUUID } from "../utils/state_management";
import { ElisaWell } from "./utils";

type ElisaWellState = {
    elisaWells: ElisaWell[]
    posted: string[]
    loading: boolean
    error: string | null
}

const initialElisaWellState: ElisaWellState = {
    elisaWells: [],
    posted: [],
    loading: false,
    error: null,
}

export const elisaWellSlice = createSlice({
    name: "elisaWells",
    initialState: initialElisaWellState,
    reducers: {
        pending: (state) => ({
            ...state,
            loading: true,
        }),
        getSuccess: (state, action: PayloadAction<ElisaWell[]>) => ({
            ...state,
            loading: false,
            elisaWells: addUniqueUUID(state.elisaWells, action.payload),
        }),
        postSuccess: (state, action: PayloadAction<ElisaWell>) => ({
            ...state,
            loading: false,
            elisaWells: addUniqueUUID(state.elisaWells, [action.payload]),
            posted: state.posted.concat(action.payload.uuid),
        }),
        fail: (state, action: PayloadAction<string>) => ({
            ...state,
            loading: false,
            error: action.payload,
        }),
    }
})

export const {
    pending: elisaWellActionPending,
    getSuccess: elisaWellActionGetSuccess,
    postSuccess: elisaWellActionPostSuccess,
    fail: elisaWellActionFail,
} = elisaWellSlice.actions

export const elisaWellReducer = elisaWellSlice.reducer;

export const selectElisaWells = (state: RootState) => state.elisaWells.elisaWells;
export const selectElisaWell = (uuid: string) => (state: RootState) => state.elisaWells.elisaWells.find((elisaWell) => elisaWell.uuid === uuid);
export const selectLoadingElisaWell = (state: RootState) => state.elisaWells.loading;
export const selectPostedElisaWells = (state: RootState) => filterUUID(state.elisaWells.elisaWells, state.elisaWells.posted);

export const getElisaWells = () => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaWellActionPending());
        getAPI<ElisaWell[]>(`elisa_well`).then(
            (elisaWells) => dispatch(elisaWellActionGetSuccess(elisaWells)),
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}

export const getElisaWell = (uuid: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaWellActionPending());
        getAPI<ElisaWell>(`elisa_well/${uuid}`).then(
            (elisaWell) => dispatch(elisaWellActionGetSuccess([elisaWell])),
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}

export const postElisaWell = (location: number, opticalDensity: number, plate: string, antigen: string, nanobody: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaWellActionPending());
        postAPI<ElisaWell>(`elisa_well`,
            {
                'location': location,
                'optical_density': opticalDensity,
                'plate': plate,
                'antigen': antigen,
                'nanbody': nanobody
            }
        ).then(
            (elisaWell) => dispatch(elisaWellActionPostSuccess(elisaWell)),
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}
