import { Nanobody } from "./utils";
import { getAPI, postAPI } from "../utils/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import { addUniqueUUID, AllFetched } from "../utils/state_management";

type NanobodyState = {
  nanobodies: Nanobody[];
  allFetched: AllFetched;
  fetchPending: string[];
  error: string | null;
};

const initialNanobodyState: NanobodyState = {
  nanobodies: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  error: null,
};

export const nanobodySlice = createSlice({
  name: "nanobody",
  initialState: initialNanobodyState,
  reducers: {
    getAllPending: (state) => ({
      ...state,
      allFetched: AllFetched.Pending,
    }),
    getAllSuccess: (state, action: PayloadAction<Nanobody[]>) => ({
      ...state,
      allFetched: AllFetched.True,
      nanobodies: addUniqueUUID(state.nanobodies, action.payload),
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
    getSuccess: (state, action: PayloadAction<Nanobody>) => ({
      ...state,
      fetchPending: state.fetchPending.filter(
        (uuid) => uuid !== action.payload.uuid
      ),
      nanobodies: addUniqueUUID(state.nanobodies, [action.payload]),
    }),
    getFail: (
      state,
      action: PayloadAction<{ uuid: string; error: string }>
    ) => ({
      ...state,
      fetchPending: state.fetchPending.filter(
        (uuid) => uuid !== action.payload.uuid
      ),
      error: action.payload.error,
    }),
    postPending: (state) => ({
      ...state,
    }),
    postSuccess: (state, action: PayloadAction<Nanobody>) => ({
      ...state,
      nanobodies: addUniqueUUID(state.nanobodies, [action.payload]),
    }),
    postFail: (state, action: PayloadAction<string>) => ({
      ...state,
      error: action.payload,
    }),
  },
});

const actions = nanobodySlice.actions;
export const nanobodyReducer = nanobodySlice.reducer;

export const selectNanobodies = (state: RootState) =>
  state.nanobodies.nanobodies;
export const selectNanobody = (uuid: string) => (state: RootState) =>
  state.nanobodies.nanobodies.find((nanobody) => nanobody.uuid === uuid);
export const selectLoadingNanobody = (state: RootState) =>
  state.nanobodies.allFetched === AllFetched.Pending ||
  Boolean(state.nanobodies.fetchPending.length);

export const getNanobodies = () => {
  return async (dispatch: DispatchType, getState: () => RootState) => {
    if (getState().nanobodies.allFetched !== AllFetched.False) return;
    dispatch(actions.getAllPending());
    getAPI<Nanobody[]>(`nanobody`).then(
      (nanobodies) => dispatch(actions.getAllSuccess(nanobodies)),
      (reason) => dispatch(actions.getAllFail(reason))
    );
  };
};

export const getNanobody = (uuid: string) => {
  return async (
    dispatch: DispatchType,
    getState: () => { nanobodies: NanobodyState }
  ) => {
    if (
      getState().nanobodies.nanobodies.find(
        (nanobody) => nanobody.uuid === uuid
      ) ||
      getState().nanobodies.fetchPending.find((nanobody) => nanobody === uuid)
    )
      return;
    dispatch(actions.getPending(uuid));
    getAPI<Nanobody>(`nanobody/${uuid}`).then(
      (nanobody) => dispatch(actions.getSuccess(nanobody)),
      (reason) => dispatch(actions.getFail(reason))
    );
  };
};

export const postNanobody = () => async (dispatch: DispatchType) => {
  dispatch(actions.postPending());
  return postAPI<Nanobody>(`nanobody`, {}).then(
    (nanobody) => {
      dispatch(actions.postSuccess(nanobody));
      return nanobody.uuid;
    },
    (reason) => {
      dispatch(actions.postFail(reason));
      return Promise.reject(reason);
    }
  );
};
