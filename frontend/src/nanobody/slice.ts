import { Nanobody } from "./utils";
import { getAPI, postAPI } from "../utils/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DispatchType, RootState } from "../store";
import {
  addUniqueUUID,
  AllFetched,
  filterUUID,
} from "../utils/state_management";

type NanobodyState = {
  nanobodies: Nanobody[];
  allFetched: AllFetched;
  fetchPending: string[];
  posted: string[];
  postPending: boolean;
  error: string | null;
};

const initialNanobodyState: NanobodyState = {
  nanobodies: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: false,
  error: null,
};

const nanobodySlice = createSlice({
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
      postPending: true,
    }),
    postSuccess: (state, action: PayloadAction<Nanobody>) => ({
      ...state,
      nanobodies: addUniqueUUID(state.nanobodies, [action.payload]),
      posted: state.posted.concat(action.payload.uuid),
      postPending: false,
    }),
    postFail: (state, action: PayloadAction<string>) => ({
      ...state,
      postPending: false,
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
export const selectPostedNanobodies = (state: RootState) =>
  filterUUID(state.nanobodies.nanobodies, state.nanobodies.posted);

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

export const postNanobody = () => {
  return async (dispatch: DispatchType) => {
    dispatch(actions.postPending());
    postAPI<Nanobody>(`nanobody`, {}).then(
      (nanobody) => dispatch(actions.postSuccess(nanobody)),
      (reason) => dispatch(actions.postFail(reason))
    );
  };
};
