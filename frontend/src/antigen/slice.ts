import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI } from "../utils/api";
import { addUniqueUUID, filterUUID } from "../utils/state_management";
import { Antigen, LocalAntigen, UniProtAntigen } from "./utils";

type AntigenState = {
    antigens: Antigen[]
    allFetchPending: boolean
    fetchPending: string[]
    postedUniProt: string[]
    postedLocal: string[]
    postPending: boolean
    error: string | null
}

const initialAntigenState: AntigenState = {
    antigens: [],
    allFetchPending: false,
    fetchPending: [],
    postedUniProt: [],
    postedLocal: [],
    postPending: false,
    error: null,
}

export const antigenSlice = createSlice({
    name: "anitgen",
    initialState: initialAntigenState,
    reducers: {
        getAllPending: (state) => ({
            ...state,
            allFetchPending: true,
        }),
        getAllSuccess: (state, action: PayloadAction<Antigen[]>) => ({
            ...state,
            allFetchPending: false,
            antigens: addUniqueUUID(state.antigens, action.payload),
        }),
        getAllFail: (state, action: PayloadAction<string>) => ({
            ...state,
            allFetchPending: false,
            error: action.payload,
        }),
        getPending: (state, action: PayloadAction<string>) => ({
            ...state,
            fetchPending: state.fetchPending.concat(action.payload),
        }),
        getSuccess: (state, action: PayloadAction<Antigen>) => ({
            ...state,
            fetchPending: state.fetchPending.filter((uuid) => uuid !== action.payload.uuid),
            antigens: addUniqueUUID(state.antigens, [action.payload]),
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
        postUniProtSuccess: (state, action: PayloadAction<Antigen>) => ({
            ...state,
            antigens: addUniqueUUID(state.antigens, [action.payload]),
            postedUniProt: state.postedUniProt.concat(action.payload.uuid),
            postPending: false,
        }),
        postLocalSuccess: (state, action: PayloadAction<Antigen>) => ({
            ...state,
            antigens: addUniqueUUID(state.antigens, [action.payload]),
            postedLocal: state.postedLocal.concat(action.payload.uuid),
            postPending: false,
        }),
        postFail: (state, action: PayloadAction<string>) => ({
            ...state,
            postPending: false,
            error: action.payload,
        })
    }
})

const actions = antigenSlice.actions;
export const antigenReducer = antigenSlice.reducer;

export const selectAntigens = (state: RootState) => state.antigens.antigens;
export const selectAntigen = (uuid: string) => (state: RootState) => state.antigens.antigens.find((antigen) => antigen.uuid === uuid);
export const selectLoadingAntigen = (state: RootState) => state.antigens.allFetchPending || Boolean(state.antigens.fetchPending);
export const selectPostedUniProtAntigens = (state: RootState) => filterUUID(state.antigens.antigens, state.antigens.postedUniProt);
export const selectPostedLocalAntignes = (state: RootState) => filterUUID(state.antigens.antigens, state.antigens.postedLocal);


export const getAntigens = () => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (getState().antigens.allFetchPending) return;
        dispatch(actions.getAllPending());
        getAPI<Antigen[]>(`antigen`).then(
            (antigens) => dispatch(actions.getAllSuccess(antigens)),
            (reason) => dispatch(actions.getAllFail(reason)),
        )
    }
}

export const getAntigen = (uuid: string) => {
    return async (dispatch: DispatchType, getState: () => RootState) => {
        if (
            getState().antigens.antigens.find((antigen) => antigen.uuid === uuid)
            || getState().antigens.fetchPending.find((antigen) => antigen === uuid)
        ) return;
        dispatch(actions.getPending(uuid));
        getAPI<Antigen>(`antigen/${uuid}`).then(
            (antigen) => dispatch(actions.getSuccess(antigen)),
            (reason) => dispatch(actions.getFail({ uuid: uuid, error: reason })),
        )
    }
}

export const postUniProtAntigen = (uniprotAccessionNumber: string) => {
    return async (dispatch: DispatchType) => {
        dispatch(actions.postPending());
        postAPI<UniProtAntigen>(`uniprot_antigen`, { "uniprot_accession_number": uniprotAccessionNumber }).then(
            async (uniProtAntigen) => {
                getAPI<Antigen>(`antigen/${uniProtAntigen.antigen}`).then(
                    (antigen) => dispatch(actions.postUniProtSuccess(antigen)),
                    (reason: string) => dispatch(actions.postFail(reason)),
                )
            },
            (reason) => dispatch(actions.postFail(reason)),
        )
    }
}

export const postLocalAntigen = (sequence: string, molecularMass: number) => {
    return async (dispatch: DispatchType) => {
        dispatch(actions.postPending());
        postAPI<LocalAntigen>(`local_antigen`, {
            'sequence': sequence,
            'molecular_mass': molecularMass
        }).then(
            async (localAntigen) => {
                getAPI<Antigen>(`antigen/${localAntigen.antigen}`).then(
                    (antigen) => dispatch(actions.postLocalSuccess(antigen)),
                    (reason) => dispatch(actions.postFail(reason)),
                )
            },
            (reason) => dispatch(actions.postFail(reason)),
        )
    }
}
