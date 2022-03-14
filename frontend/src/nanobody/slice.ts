import { Nanobody, NanobodyRef, NanobodyPost } from "./utils";
import { APIRejection, getAPI, postAPI } from "../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  addUniqueByKeys,
  AllFetched,
  filterPartial,
  partialEq,
} from "../utils/state_management";

type NanobodyState = {
  nanobodies: Nanobody[];
  allFetched: AllFetched;
  fetchPending: NanobodyRef[];
  posted: NanobodyRef[];
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
  NanobodyRef,
  {
    state: RootState;
    rejectValue: { key: NanobodyRef; apiRejection: APIRejection };
  }
>(
  "nanobodies/getNanobody",
  (key, { rejectWithValue }) =>
    getAPI<Nanobody>(`nanobody/${key.project}:${key.number}`).catch(
      (apiRejection) => rejectWithValue({ key, apiRejection })
    ),
  {
    condition: (key, { getState }) =>
      filterPartial(getState().nanobodies.nanobodies, key).length === 0 &&
      filterPartial(getState().nanobodies.fetchPending, key).length === 0,
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
      state.nanobodies = addUniqueByKeys(state.nanobodies, action.payload, [
        "project",
        "number",
      ]);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getNanobodies.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getNanobody.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getNanobody.fulfilled, (state, action) => {
      state.nanobodies = addUniqueByKeys(
        state.nanobodies,
        [action.payload],
        ["project", "number"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg)
      );
    });
    builder.addCase(getNanobody.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg)
      );
    });
    builder.addCase(postNanobody.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postNanobody.fulfilled, (state, action) => {
      state.nanobodies = addUniqueByKeys(
        state.nanobodies,
        [action.payload],
        ["project", "number"]
      );
      state.posted = state.posted.concat({
        project: action.payload.project,
        number: action.payload.number,
      });
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
export const selectNanobody =
  (nanobodyRef: NanobodyRef) => (state: RootState) =>
    state.nanobodies.nanobodies.find((nanobody) =>
      partialEq(nanobody, nanobodyRef)
    );
export const selectLoadingNanobody = (state: RootState) =>
  state.nanobodies.allFetched === AllFetched.Pending ||
  Boolean(state.nanobodies.fetchPending.length);
export const selectPostedNanobodies = (state: RootState) =>
  state.nanobodies.posted.flatMap((posted) =>
    filterPartial(state.nanobodies.nanobodies, posted)
  );
