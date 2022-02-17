import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { elisaWellActionFail } from "../elisa_well/slice";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, filterUUID } from "../utils/state_management";
import { ElisaPlate } from "./utils";

type ElisaPlateState = {
    elisaPlates: ElisaPlate[]
    posted: string[]
    loading: boolean
    error: string | null
}

const initialElisaPlateState: ElisaPlateState = {
    elisaPlates: [],
    posted: [],
    loading: false,
    error: null
}

export const elisaPlateSlice = createSlice({
    name: "elisaPlates",
    initialState: initialElisaPlateState,
    reducers: {
        pending: (state) => ({
            ...state,
            loading: true,
        }),
        getSuccess: (state, action: PayloadAction<ElisaPlate[]>) => ({
            ...state,
            loading: false,
            elisaPlates: addUniqueUUID(state.elisaPlates, action.payload),
        }),
        postSuccess: (state, action: PayloadAction<ElisaPlate>) => ({
            ...state,
            loading: false,
            elisaPlates: addUniqueUUID(state.elisaPlates, [action.payload]),
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
    pending: elisaPlateActionPending,
    getSuccess: elisaPlateActionGetSuccess,
    postSuccess: elisaPlateActionPostSuccess,
    fail: elisaPlateActionFail,
} = elisaPlateSlice.actions;

export const elisaPlateReducer = elisaPlateSlice.reducer;

export const selectElisaPlates = (state: RootState) => state.elisaPlates.elisaPlates;
export const selectElisaPlate = (uuid: string) => (state: RootState) => state.elisaPlates.elisaPlates.find((elisaPlate) => elisaPlate.uuid === uuid);
export const selectLoadingElisaPlate = (state: RootState) => state.elisaPlates.loading;
export const selectPostedElisaPlates = (state: RootState) => filterUUID(state.elisaPlates.elisaPlates, state.elisaPlates.posted);

export const getElisaPlates = () => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaPlateActionPending());
        getAPI<ElisaPlate[]>(`elisa_plate`).then(
            (elisaPlates) => dispatch(elisaPlateActionGetSuccess(elisaPlates)),
            (reason) => dispatch(elisaPlateActionFail(reason)),
        )
    }
}

export const getElisaPlate = (uuid: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaPlateActionPending());
        getAPI<ElisaPlate>(`elisa_plate/${uuid}`).then(
            (elisaPlate) => dispatch(elisaPlateActionGetSuccess([elisaPlate])),
            (reason) => dispatch(elisaPlateActionFail(reason)),
        )
    }
}

export const postElisaPlate = (threshold: number) => {
    return async (dispatch: DispatchType) => {
        dispatch(elisaPlateActionPending());
        postAPI<ElisaPlate>(`elisa_plate`,
            {
                'threshold': threshold
            }
        ).then(
            (elisaPlate) => dispatch(elisaPlateActionPostSuccess(elisaPlate)),
            (reason) => dispatch(elisaWellActionFail(reason)),
        )
    }
}