import { Nanobody, NanobodyRef, NanobodyPost } from "./utils";
import { APIRejection, getAPI, postAPI } from "../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  mergeByKeys,
  filterPartial,
  propsEq,
  partialEq,
} from "../utils/state_management";
import { ProjectRef } from "../project/utils";

type NanobodyState = {
  nanobodies: Nanobody[];
  fetched: Array<Partial<NanobodyRef> & { plate?: number }>;
  fetchPending: Array<Partial<NanobodyRef> & { plate?: number }>;
  posted: Array<NanobodyRef>;
  postPending: boolean;
};

const initialNanobodyState: NanobodyState = {
  nanobodies: [],
  fetched: [],
  fetchPending: [],
  posted: [],
  postPending: false,
};

export const getNanobodies = createAsyncThunk<
  Array<Nanobody>,
  Partial<Pick<NanobodyRef, "project">> & { plate?: number },
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "nanobodies/getNanobodies",
  (params, { rejectWithValue }) =>
    getAPI<Array<Nanobody>>("nanobody", params).catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (params, { getState }) =>
      !getState()
        .nanobodies.fetched.concat(getState().nanobodies.fetchPending)
        .some((got) => partialEq(params, got)),
  }
);

export const getNanobody = createAsyncThunk<
  Nanobody,
  NanobodyRef & { plate?: number },
  {
    state: RootState;
    rejectValue: { key: NanobodyRef; apiRejection: APIRejection };
  }
>(
  "nanobodies/getNanobody",
  (key, { rejectWithValue }) =>
    getAPI<Nanobody>(`nanobody/${key.project}:${key.number}`, {}).catch(
      (apiRejection) => rejectWithValue({ key, apiRejection })
    ),
  {
    condition: (nanobodyRef, { getState }) =>
      !getState()
        .nanobodies.fetched.concat(getState().nanobodies.fetchPending)
        .some(
          (got) =>
            partialEq(
              { project: nanobodyRef.project, number: nanobodyRef.number },
              got
            ) ||
            partialEq(
              { project: nanobodyRef.project, plate: nanobodyRef.plate },
              got
            )
        ),
  }
);

export const generateNanobodies = (quantity: number, project: ProjectRef) =>
  postNanobodies(Array.from({ length: quantity }).map(() => ({ project })));

export const postNanobodies = createAsyncThunk<
  Array<Nanobody>,
  Array<NanobodyPost>,
  { rejectValue: { apiRejection: APIRejection } }
>("nanobodies/postNanobodies", (post, { rejectWithValue }) =>
  postAPI<Array<NanobodyPost>, Array<Nanobody>>("nanobody", post).catch(
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

const nanobodySlice = createSlice({
  name: "nanobody",
  initialState: initialNanobodyState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getNanobodies.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getNanobodies.fulfilled, (state, action) => {
      state.nanobodies = mergeByKeys(state.nanobodies, action.payload, [
        "project",
        "number",
      ]);
      state.fetchPending = state.fetchPending.filter(
        (pending) => !propsEq(pending, action.meta.arg)
      );
      state.fetched = state.fetched.concat(action.meta.arg);
    });
    builder.addCase(getNanobodies.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !propsEq(pending, action.meta.arg)
      );
    });
    builder.addCase(getNanobody.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getNanobody.fulfilled, (state, action) => {
      state.nanobodies = mergeByKeys(
        state.nanobodies,
        [action.payload],
        ["project", "number"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => !propsEq(pending, action.meta.arg)
      );
      state.fetched = state.fetched.concat(action.meta.arg);
    });
    builder.addCase(getNanobody.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !propsEq(pending, action.meta.arg)
      );
    });
    builder.addCase(postNanobodies.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postNanobodies.fulfilled, (state, action) => {
      state.nanobodies = mergeByKeys(state.nanobodies, action.payload, [
        "project",
        "number",
      ]);
      state.posted = state.posted.concat(action.payload);
      state.postPending = false;
    });
    builder.addCase(postNanobodies.rejected, (state) => {
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
  Boolean(state.nanobodies.fetchPending.length);
export const selectPostedNanobodies = (state: RootState) =>
  state.nanobodies.posted.flatMap((posted) =>
    filterPartial(state.nanobodies.nanobodies, posted)
  );
