import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { getAPI, postAPI, putAPI } from "../utils/api";
import { addUniqueUUID, AllFetched } from "../utils/state_management";
import { ElisaWell, ElisaWellKey, ElisaWellPost } from "./utils";

type ElisaWellState = {
  elisaWells: ElisaWell[];
  allFetched: AllFetched;
  fetchPending: ElisaWellKey[];
  posted: ElisaWellKey[];
  postPending: boolean;
  error: string | null;
};

const initialElisaWellState: ElisaWellState = {
  elisaWells: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: false,
  error: null,
};

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
    getPending: (state, action: PayloadAction<ElisaWellKey>) => ({
      ...state,
      fetchPending: state.fetchPending.concat(action.payload),
    }),
    getSuccess: (state, action: PayloadAction<ElisaWell>) => ({
      ...state,
      fetchPending: state.fetchPending.filter(
        ({ plate, location }) =>
          plate !== action.payload.plate || location !== action.payload.location
      ),
      elisaWells: addUniqueUUID(state.elisaWells, [action.payload]),
    }),
    getFail: (
      state,
      action: PayloadAction<ElisaWellKey & { error: string }>
    ) => ({
      ...state,
      fetchPending: state.fetchPending.filter(
        ({ plate, location }) =>
          plate !== action.payload.plate || location !== action.payload.location
      ),
      error: action.payload.error,
    }),
    postPending: (state) => ({
      ...state,
      postPending: true,
    }),
    postSuccess: (state, action: PayloadAction<ElisaWell>) => ({
      ...state,
      elisaWells: addUniqueUUID(state.elisaWells, [action.payload]),
      posted: state.posted.concat({
        plate: action.payload.plate,
        location: action.payload.location,
      }),
      postPending: false,
    }),
    postFail: (state, action: PayloadAction<string>) => ({
      ...state,
      postPending: false,
      error: action.payload,
    }),
  },
});

const actions = elisaWellSlice.actions;
export const elisaWellReducer = elisaWellSlice.reducer;

export const selectElisaWells = (state: RootState) =>
  state.elisaWells.elisaWells;
export const selectElisaWell =
  ({ plate, location }: ElisaWellKey) =>
  (state: RootState) =>
    state.elisaWells.elisaWells.find(
      (elisaWell) =>
        elisaWell.plate === plate && elisaWell.location === location
    );
export const selectLoadingElisaWell = (state: RootState) =>
  state.elisaWells.allFetched === AllFetched.Pending ||
  Boolean(state.elisaWells.fetchPending.length);
export const selectPostedElisaWells = (state: RootState) =>
  state.elisaWells.posted
    .map(({ plate, location }) =>
      state.elisaWells.elisaWells.find(
        (elisaWell) =>
          elisaWell.plate === plate && elisaWell.location === location
      )
    )
    .filter((elisaWell): elisaWell is ElisaWell => !!elisaWell);

export const getElisaWells = () => {
  return async (dispatch: DispatchType, getState: () => RootState) => {
    if (getState().elisaWells.allFetched !== AllFetched.False) return;
    dispatch(actions.getAllPending());
    getAPI<ElisaWell[]>(`elisa_well`).then(
      (elisaWells) => dispatch(actions.getAllSuccess(elisaWells)),
      (reason) => dispatch(actions.getAllFail(reason))
    );
  };
};

export const getElisaWell = ({ plate, location }: ElisaWellKey) => {
  return async (dispatch: DispatchType, getState: () => RootState) => {
    if (
      getState().elisaWells.elisaWells.find(
        (elisaWell) =>
          elisaWell.plate === plate && elisaWell.location === location
      ) ||
      getState().elisaWells.fetchPending.find(
        (elisaWell) =>
          elisaWell.plate === plate && elisaWell.location === location
      )
    )
      return;
    dispatch(actions.getPending({ plate, location }));
    getAPI<ElisaWell>(`elisa_well/${plate}:${location}`).then(
      (elisaWell) => dispatch(actions.getSuccess(elisaWell)),
      (reason) => dispatch(actions.getFail({ plate, location, error: reason }))
    );
  };
};

export const postElisaWell = (elisaWell: ElisaWellPost) => {
  return async (dispatch: DispatchType) => {
    dispatch(actions.postPending());
    postAPI<ElisaWell>(`elisa_well`, elisaWell).then(
      (elisaWell) => dispatch(actions.postSuccess(elisaWell)),
      (reason) => dispatch(actions.postFail(reason))
    );
  };
};

export const putElisaWell = (elisaWell: ElisaWellPost) => {
  return async (dispatch: DispatchType, getState: () => void) => {
    dispatch(actions.postPending());
    putAPI<ElisaWellPost, ElisaWell>(
      `elisa_well/${elisaWell.plate}:${elisaWell.location}`,
      elisaWell
    ).then(
      (elisaWell) => dispatch(actions.postSuccess(elisaWell)),
      (reason) => dispatch(actions.postFail(reason))
    );
  };
};
