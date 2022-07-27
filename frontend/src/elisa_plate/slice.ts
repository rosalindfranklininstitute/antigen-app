import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ElisaWell } from "../elisa_well/utils";
import { projectItemURI } from "../project/utils";
import { RootState } from "../store";
import { APIRejection, getAPI, postAPI, putAPI } from "../utils/api";
import {
  mergeByKeys,
  AllFetched,
  filterKeys,
  keyEq,
} from "../utils/state_management";
import { ElisaPlate, ElisaPlatePost, ElisaPlateRef} from "./utils";

type ElisaPlateState = {
  elisaPlates: ElisaPlate[];
  allFetched: AllFetched;
  fetchPending: ElisaPlateRef[];
  posted: ElisaPlateRef[];
  postPending: boolean;
};

const initialElisaPlateState: ElisaPlateState = {
  elisaPlates: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: false,
};

export const getElisaPlates = createAsyncThunk<
  Array<ElisaPlate>,
  Partial<Pick<ElisaPlateRef, "project">>,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "elisaPlates/getElisaPlates",
  (params, { rejectWithValue }) =>
    getAPI<Array<ElisaPlate>>("elisa_plate", params).catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().elisaPlates.allFetched === AllFetched.False,
  }
);

export const getElisaPlate = createAsyncThunk<
  ElisaPlate,
  ElisaPlateRef,
  {
    state: RootState;
    rejectValue: { elisaPlateRef: ElisaPlateRef; apiRejection: APIRejection };
  }
>(
  "elisaPlates/getElisaPlate",
  (elisaPlateRef, { rejectWithValue }) =>
    getAPI<ElisaPlate>(
      `elisa_plate/${elisaPlateRef.project}:${elisaPlateRef.number}`,
      {}
    ).catch((apiRejection) =>
      rejectWithValue({ elisaPlateRef: elisaPlateRef, apiRejection })
    ),
  {
    condition: (elisaPlateRef, { getState }) =>
      filterKeys(getState().elisaPlates.elisaPlates, elisaPlateRef, [
        "project",
        "number",
      ]).length === 0 &&
      filterKeys(getState().elisaPlates.fetchPending, elisaPlateRef, [
        "project",
        "number",
      ]).length === 0,
  }
);

export const postElisaPlate = createAsyncThunk<
  ElisaPlate,
  ElisaPlatePost,
  { rejectValue: { apiRejection: APIRejection } }
>("elisaPlates/postElisaPlate", (post, { rejectWithValue }) =>
  postAPI<ElisaPlatePost, ElisaPlate>("elisa_plate", post).catch(
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

export const putElisaPlate = createAsyncThunk<
  { elisaPlate: ElisaPlate; elisaWells: Array<ElisaWell> },
  ElisaPlateRef & ElisaPlatePost,
  { rejectValue: { apiRejection: APIRejection } }
>("elisaPlates", (post, { rejectWithValue }) =>
  putAPI<ElisaPlatePost, ElisaPlate>(
    `elisa_plate/${projectItemURI(post)}`,
    post
  ).then(
    async (elisaPlate) => ({
      elisaPlate,
      elisaWells: await getAPI<Array<ElisaWell>>("elisa_well", {
        project: elisaPlate.project,
        plate: elisaPlate.number,
      }),
    }),
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

const elisaPlateSlice = createSlice({
  name: "elisaPlates",
  initialState: initialElisaPlateState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getElisaPlates.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getElisaPlates.fulfilled, (state, action) => {
      state.elisaPlates = mergeByKeys(state.elisaPlates, action.payload, [
        "project",
        "number",
      ]);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getElisaPlates.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getElisaPlate.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = mergeByKeys(
        state.elisaPlates,
        [action.payload],
        ["project", "number"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => !keyEq(pending, action.meta.arg, ["project", "number"])
      );
    });
    builder.addCase(getElisaPlate.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !keyEq(pending, action.meta.arg, ["project", "number"])
      );
    });
    builder.addCase(postElisaPlate.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = mergeByKeys(
        state.elisaPlates,
        [action.payload],
        ["project", "number"]
      );
      state.posted = state.posted.concat(action.payload);
      state.postPending = false;
    });
    builder.addCase(postElisaPlate.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaPlate.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(putElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = mergeByKeys(
        state.elisaPlates,
        [action.payload.elisaPlate],
        ["project", "number"]
      );
      state.posted = state.posted.concat(action.payload.elisaPlate);
      state.postPending = false;
    });
    builder.addCase(putElisaPlate.rejected, (state) => {
      state.postPending = false;
    });
  },
});

export const elisaPlateReducer = elisaPlateSlice.reducer;

export const selectElisaPlates = (state: RootState) =>
  state.elisaPlates.elisaPlates;
export const selectElisaPlate =
  (elisaPlateRef: ElisaPlateRef) => (state: RootState) =>
    state.elisaPlates.elisaPlates.find((elisaPlate) =>
      keyEq(elisaPlate, elisaPlateRef, ["project", "number"])
    );
export const selectLoadingElisaPlate = (state: RootState) =>
  state.elisaPlates.allFetched === AllFetched.Pending ||
  Boolean(state.elisaPlates.fetchPending.length);
