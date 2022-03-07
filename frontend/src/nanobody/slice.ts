import { Nanobody, NanobodyPost } from "./utils";
import { APIRejection, getAPI, postAPI } from "../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
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
};

const initialNanobodyState: NanobodyState = {
  nanobodies: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: false,
};

export const getNanobodies = createAsyncThunk<
  Array<Nanobody>,
  void,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "nanobodies/getNanobodies",
  (_, { rejectWithValue }) =>
    getAPI<Array<Nanobody>>("nanobody").catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().nanobodies.allFetched === AllFetched.False,
  }
);

export const getNanobody = createAsyncThunk<
  Nanobody,
  string,
  {
    state: RootState;
    rejectValue: { uuid: string; apiRejection: APIRejection };
  }
>(
  "nanobodies/getNanobody",
  (uuid: string, { rejectWithValue }) =>
    getAPI<Nanobody>(`nanobody/${uuid}`).catch((apiRejection) =>
      rejectWithValue({ uuid, apiRejection })
    ),
  {
    condition: (uuid, { getState }) =>
      getState().nanobodies.nanobodies.filter(
        (nanobodies) => nanobodies.uuid === uuid
      ).length === 0 &&
      getState().nanobodies.fetchPending.filter(
        (nanobodies) => nanobodies === uuid
      ).length === 0,
  }
);

export const postNanobody = createAsyncThunk<
  Nanobody,
  NanobodyPost,
  { rejectValue: { apiRejection: APIRejection } }
>("nanobodies/postNanobody", (post, { rejectWithValue }) =>
  postAPI<NanobodyPost, Nanobody>("nanobody", post).catch((apiRejection) =>
    rejectWithValue({ apiRejection })
  )
);

const nanobodySlice = createSlice({
  name: "nanobody",
  initialState: initialNanobodyState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getNanobodies.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getNanobodies.fulfilled, (state, action) => {
      state.nanobodies = addUniqueUUID(state.nanobodies, action.payload);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getNanobodies.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getNanobody.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getNanobody.fulfilled, (state, action) => {
      state.nanobodies = addUniqueUUID(state.nanobodies, [action.payload]);
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload.uuid
      );
    });
    builder.addCase(getNanobody.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload?.uuid
      );
    });
    builder.addCase(postNanobody.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postNanobody.fulfilled, (state, action) => {
      state.nanobodies = addUniqueUUID(state.nanobodies, [action.payload]);
      state.posted = state.posted.concat(action.payload.uuid);
      state.postPending = false;
    });
    builder.addCase(postNanobody.rejected, (state) => {
      state.postPending = false;
    });
  },
});

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
