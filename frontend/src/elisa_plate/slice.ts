import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, AllFetched, filterUUID } from "../utils/state_management";
import { ElisaPlate } from "./utils";

type ElisaPlateState = {
    elisaPlates: ElisaPlate[]
    allFetched: AllFetched
    fetchPending: string[]
    posted: string[]
    postPending: boolean
    error: string | null
}

const initialElisaPlateState: ElisaPlateState = {
    elisaPlates: [],
    allFetched: AllFetched.False,
    fetchPending: [],
    posted: [],
    postPending: false,
    error: null
}

export const elisaPlateSlice = createSlice({
    name: "elisaPlates",
    initialState: initialElisaPlateState,
    reducers: {
        getAllPending: (state) => ({
            ...state,
            allFetched: AllFetched.Pending,
        }),
        getAllSuccess: (state, action: PayloadAction<ElisaPlate[]>) => ({
            ...state,
            allFetched: AllFetched.True,
            elisaPlates: addUniqueUUID(state.elisaPlates, action.payload),
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
        getSuccess: (state, action: PayloadAction<ElisaPlate>) => ({
            ...state,
            fetchPending: state.fetchPending.filter((uuid) => uuid !== action.payload.uuid),
            elisaPlates: state.elisaPlates.concat(action.payload),
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
        postSuccess: (state, action: PayloadAction<ElisaPlate>) => ({
            ...state,
            postPending: false,
            elisaPlates: addUniqueUUID(state.elisaPlates, [action.payload]),
            posted: state.posted.concat(action.payload.uuid),
        }),
        postFail: (state, action: PayloadAction<string>) => ({
            ...state,
            postPending: false,
            error: action.payload
        }),
    }
})

const actions = elisaPlateSlice.actions;
export const elisaPlateReducer = elisaPlateSlice.reducer;

export const selectElisaPlates = (state: RootState) => state.elisaPlates.elisaPlates;
export const selectElisaPlate = (uuid: string) => (state: RootState) => state.elisaPlates.elisaPlates.find((elisaPlate) => elisaPlate.uuid === uuid);
export const selectLoadingElisaPlate = (state: RootState) => state.elisaPlates.allFetched === AllFetched.Pending || Boolean(state.elisaPlates.fetchPending.length);
export const selectPostedElisaPlates = (state: RootState) => filterUUID(state.elisaPlates.elisaPlates, state.elisaPlates.posted);

export const getElisaPlates = () => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (getState().elisaPlates.allFetched === AllFetched.False) return;
        dispatch(actions.getAllPending());
        getAPI<ElisaPlate[]>(`elisa_plate`).then(
            (elisaPlates) => dispatch(actions.getAllSuccess(elisaPlates)),
            (reason) => dispatch(actions.getAllFail(reason)),
        )
    }
}

export const getElisaPlate = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (
            getState().elisaPlates.elisaPlates.find((elisaPlate) => elisaPlate.uuid === uuid)
            || getState().elisaPlates.fetchPending.find((elisaPlate) => elisaPlate === uuid)
        ) return;
        dispatch(actions.getPending(uuid));
        getAPI<ElisaPlate>(`elisa_plate/${uuid}`).then(
            (elisaPlate) => dispatch(actions.getSuccess(elisaPlate)),
            (reason) => dispatch(actions.getFail({ uuid: uuid, error: reason })),
        )
    }
}

export const postElisaPlate = (threshold: number) => {
    return async (dispatch: DispatchType) => {
        dispatch(actions.postPending());
        postAPI<ElisaPlate>(`elisa_plate`,
            {
                'threshold': threshold
            }
        ).then(
            (elisaPlate) => dispatch(actions.postSuccess(elisaPlate)),
            (reason) => dispatch(actions.postFail(reason)),
        )
    }
}