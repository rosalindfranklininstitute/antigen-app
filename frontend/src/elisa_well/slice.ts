import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI, putAPI } from "../utils/api";
import { addUniqueUUID, AllFetched, filterUUID } from "../utils/state_management";
import { ElisaWell } from "./utils";

type ElisaWellState = {
    elisaWells: ElisaWell[]
    allFetched: AllFetched
    fetchPending: string[]
    posted: string[]
    postPending: boolean
    error: string | null
}

const initialElisaWellState: ElisaWellState = {
    elisaWells: [],
    allFetched: AllFetched.False,
    fetchPending: [],
    posted: [],
    postPending: false,
    error: null,
}

export const elisaWellSlice = createSlice({
    name: "elisaWells",
    initialState: initialElisaWellState,
    reducers: {
        getAllPending: (state) => ({
            ...state,
            allFetched: AllFetched.Pending,
        }),
        getAllSuccess: (state, action: PayloadAction<ElisaWell[]>) => ({
            ...state,
            allFetched: AllFetched.True,
            elisaWells: addUniqueUUID(state.elisaWells, action.payload),
        }),
        getAllFail: (state, action: PayloadAction<string>) => ({
            ...state,
            allFetched: AllFetched.False,
            error: action.payload,
        }),
        getPending: (state, action: PayloadAction<string>) => ({
            ...state,
            fetchPending: state.fetchPending.concat(action.payload),
        }),
        getSuccess: (state, action: PayloadAction<ElisaWell>) => ({
            ...state,
            fetchPending: state.fetchPending.filter((uuid) => uuid !== action.payload.uuid),
            elisaWells: addUniqueUUID(state.elisaWells, [action.payload]),
        }),
        getFail: (state, action: PayloadAction<{ uuid: string, error: string }>) => ({
            ...state,
            fetchPending: state.fetchPending.filter((uuid) => uuid !== action.payload.uuid),
            error: action.payload.error,
        }),
        postPending: (state) => ({
            ...state,
            postPending: true,
        }),
        postSuccess: (state, action: PayloadAction<ElisaWell>) => ({
            ...state,
            elisaWells: addUniqueUUID(state.elisaWells, [action.payload]),
            posted: state.posted.concat(action.payload.uuid),
            postPending: false,
        }),
        postFail: (state, action: PayloadAction<string>) => ({
            ...state,
            postPending: false,
            error: action.payload,
        }),
    }
})

const actions = elisaWellSlice.actions;
export const elisaWellReducer = elisaWellSlice.reducer;

export const selectElisaWells = (state: RootState) => state.elisaWells.elisaWells;
export const selectElisaWell = (uuid: string) => (state: RootState) => state.elisaWells.elisaWells.find((elisaWell) => elisaWell.uuid === uuid);
export const selectLoadingElisaWell = (state: RootState) => state.elisaWells.allFetched === AllFetched.Pending || Boolean(state.elisaWells.fetchPending.length);
export const selectPostedElisaWells = (state: RootState) => filterUUID(state.elisaWells.elisaWells, state.elisaWells.posted);

export const getElisaWells = () => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (getState().elisaWells.allFetched !== AllFetched.False) return;
        dispatch(actions.getAllPending());
        getAPI<ElisaWell[]>(`elisa_well`).then(
            (elisaWells) => dispatch(actions.getAllSuccess(elisaWells)),
            (reason) => dispatch(actions.getAllFail(reason)),
        )
    }
}

export const getElisaWell = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (
            getState().elisaWells.elisaWells.find((elisaWell) => elisaWell.uuid === uuid)
            || getState().elisaWells.fetchPending.find((elisaWell) => elisaWell === uuid)
        ) return;
        dispatch(actions.getPending(uuid));
        getAPI<ElisaWell>(`elisa_well/${uuid}`).then(
            (elisaWell) => dispatch(actions.getSuccess(elisaWell)),
            (reason) => dispatch(actions.getFail({ uuid: uuid, error: reason })),
        )
    }
}

export const postElisaWell = (location: number, opticalDensity: number, plate: string, antigen: string, nanobody: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(actions.postPending());
        postAPI<ElisaWell>(`elisa_well`,
            {
                'location': location,
                'optical_density': opticalDensity,
                'plate': plate,
                'antigen': antigen,
                'nanbody': nanobody
            }
        ).then(
            (elisaWell) => dispatch(actions.postSuccess(elisaWell)),
            (reason) => dispatch(actions.postFail(reason)),
        )
    }
}

export const putElisaWell = (elisaWell: ElisaWell) => {
    return async (dispatch: DispatchType, getState: () => void) => {
        dispatch(actions.postPending());
        putAPI<ElisaWell>(`elisa_well/${elisaWell.uuid}`, elisaWell).then(
            (elisaWell) => dispatch(actions.postSuccess(elisaWell)),
            (reason) => dispatch(actions.postFail(reason)),
        )
    }
}
