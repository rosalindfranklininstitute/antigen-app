import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAntigen, selectAntigen } from "../antigen/slice";
import { getNanobody, selectNanobody } from "../nanobody/slice";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, filterUUID } from "../utils/state_management";
import { ElisaWell, DetailedElisaWell } from "./utils";

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
export const selectDetailedElisaWell = (uuid: string) => (state: RootState): DetailedElisaWell | undefined => {
    const elisaWell = state.elisaWells.elisaWells.find((elisaWell) => elisaWell.uuid === uuid);
    if (!elisaWell) return undefined;
    const antigen = selectAntigen(elisaWell.antigen)(state);
    const nanobody = selectNanobody(elisaWell.nanobody)(state);
    if (!antigen || !nanobody) return undefined;
    return {
        uuid: elisaWell.uuid,
        plate: elisaWell.plate,
        location: elisaWell.location,
        antigen: antigen,
        nanobody: nanobody,
        optical_density: elisaWell.optical_density,
        functional: elisaWell.functional,
    }
}
export const selectLoadingDetailedElisaWell = (state: RootState) => state.elisaWells.loading || state.antigens.loading || state.nanobodies.loading;

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

export const getDetailedElisaWell = (uuid: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaWellActionPending());
        getAPI<ElisaWell>(`elisa_well/${uuid}`).then(
            (elisaWell) => {
                dispatch(elisaWellActionGetSuccess([elisaWell]));
                dispatch(getAntigen(elisaWell.antigen));
                dispatch(getNanobody(elisaWell.nanobody));
            },
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}

export const postElisaWell = () => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaWellActionPending());
        postAPI<ElisaWell>(`elisa_well`, {}).then(
            (elisaWell) => dispatch(elisaWellActionPostSuccess(elisaWell)),
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}
