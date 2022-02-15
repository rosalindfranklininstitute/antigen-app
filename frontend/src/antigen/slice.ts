import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { nanobodyActionPending } from "../nanobody/slice";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, filterUUID } from "../utils/state_management";
import { Antigen, LocalAntigen, UniProtAntigen } from "./utils";

type AntigenState = {
    antigens: Antigen[]
    postedUniProt: string[]
    postedLocal: string[]
    loading: boolean
    error: string | null
}

const initialAntigenState: AntigenState = {
    antigens: [],
    postedUniProt: [],
    postedLocal: [],
    loading: false,
    error: null,
}

export const antigenSlice = createSlice({
    name: "anitgen",
    initialState: initialAntigenState,
    reducers: {
        pending: (state) => ({
            ...state,
            loading: true,
        }),
        getSuccess: (state, action: PayloadAction<Antigen[]>) => ({
            ...state,
            loading: false,
            antigens: addUniqueUUID(state.antigens, action.payload)
        }),
        postUniProtSuccess: (state, action: PayloadAction<Antigen>) => ({
            ...state,
            loading: false,
            antigens: addUniqueUUID(state.antigens, [action.payload]),
            postedUniProt: state.postedUniProt.concat(action.payload.uuid),
        }),
        postLocalSuccess: (state, action: PayloadAction<Antigen>) => ({
            ...state,
            loading: false,
            antigens: addUniqueUUID(state.antigens, [action.payload]),
            postedLocal: state.postedLocal.concat(action.payload.uuid),
        }),
        fail: (state, action: PayloadAction<string>) => ({
            ...state,
            loading: false,
            error: action.payload,
        })
    }
})

export const {
    pending: antigenActionPending,
    getSuccess: antigenActionGetSuccess,
    postUniProtSuccess: antigenActionPostUniProtSuccess,
    postLocalSuccess: antigenActionPostLocalSuccess,
    fail: antigenActionFail,
} = antigenSlice.actions

export const antigenReducer = antigenSlice.reducer;

export const selectAntigens = (state: RootState) => state.antigens.antigens;
export const selectAntigen = (uuid: string) => (state: RootState) => state.antigens.antigens.find((antigen) => antigen.uuid === uuid);
export const selectLoadingAntigen = (state: RootState) => state.antigens.loading;
export const selectPostedUniProtAntigens = (state: RootState) => filterUUID(state.antigens.antigens, state.antigens.postedUniProt);
export const selectPostedLocalAntignes = (state: RootState) => filterUUID(state.antigens.antigens, state.antigens.postedLocal);


export const getAntigens = () => {
    return async (dispatch: DispatchType) => {
        dispatch(antigenActionPending());
        getAPI<Antigen[]>(`antigen`).then(
            (antigens) => dispatch(antigenActionGetSuccess(antigens)),
            (reason) => dispatch(antigenActionFail(reason)),
        )
    }
}

export const getAntigen = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => { antigens: AntigenState }) => {
        const state = getState();
        if (state.antigens.antigens.find((antigen) => antigen.uuid === uuid)) return;
        dispatch(antigenActionPending());
        getAPI<Antigen>(`antigen/${uuid}`).then(
            (antigen) => dispatch(antigenActionGetSuccess([antigen])),
            (reason) => dispatch(antigenActionFail(reason)),
        )
    }
}

export const postUniProtAntigen = (uniprotAccessionNumber: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(nanobodyActionPending());
        postAPI<UniProtAntigen>(`uniprot_antigen`, { "uniprot_accession_number": uniprotAccessionNumber }).then(
            async (uniProtAntigen) => {
                getAPI<Antigen>(`antigen/${uniProtAntigen.antigen}`).then(
                    (antigen) => dispatch(antigenActionPostUniProtSuccess(antigen)),
                    (reason) => dispatch(antigenActionFail(reason)),
                )
            },
            (reason) => dispatch(antigenActionFail(reason)),
        )
    }
}

export const postLocalAntigen = (sequence: string, molecularMass: number) => {
    return async (dispatch: DispatchType) => {
        dispatch(nanobodyActionPending());
        postAPI<LocalAntigen>(`local_antigen`, {
            'sequence': sequence,
            'molecular_mass': molecularMass
        }).then(
            async (localAntigen) => {
                getAPI<Antigen>(`antigen/${localAntigen.antigen}`).then(
                    (antigen) => dispatch(antigenActionPostLocalSuccess(antigen)),
                    (reason) => dispatch(antigenActionFail(reason)),
                )
            },
            (reason) => dispatch(antigenActionFail(reason)),
        )
    }
}
