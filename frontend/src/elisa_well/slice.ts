import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { putElisaPlate } from "../elisa_plate/slice";
import { RootState } from "../store";
import { APIRejection, getAPI, postAPI, putAPI } from "../utils/api";
import {
  addUniqueByKeys,
  AllFetched,
  filterPartial,
  partialEq,
} from "../utils/state_management";
import {
  ElisaWell,
  ElisaWellRef,
  ElisaWellPost,
  serializeElisaWellRef,
} from "./utils";

type ElisaWellState = {
  elisaWells: ElisaWell[];
  allFetched: AllFetched;
  fetchPending: ElisaWellRef[];
  posted: ElisaWellRef[];
  postPending: boolean;
};

const initialElisaWellState: ElisaWellState = {
  elisaWells: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: false,
};

export const getElisaWells = createAsyncThunk<
  Array<ElisaWell>,
  Partial<Pick<ElisaWellRef, "project" | "plate">>,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "elisaWells/getElisaWells",
  (params, { rejectWithValue }) =>
    getAPI<Array<ElisaWell>>(`elisa_well`, params).catch((apiRejection) =>
      rejectWithValue({ apiRejection: apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().elisaWells.allFetched === AllFetched.False,
  }
);

export const getElisaWell = createAsyncThunk<
  ElisaWell,
  { elisaWellRef: ElisaWellRef; force?: boolean },
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "elisaWells/getElisaWell",
  ({ elisaWellRef }, { rejectWithValue }) =>
    getAPI<ElisaWell>(
      `elisa_well/${elisaWellRef.project}:${elisaWellRef.plate}:${elisaWellRef.location}`,
      {}
    ).catch((apiRejection) => rejectWithValue({ apiRejection: apiRejection })),
  {
    condition: ({ elisaWellRef, force }, { getState }) =>
      force ||
      (filterPartial(getState().elisaWells.elisaWells, elisaWellRef).length ===
        0 &&
        filterPartial(getState().elisaWells.fetchPending, elisaWellRef)
          .length === 0),
  }
);

export const postElisaWells = createAsyncThunk<
  Array<ElisaWell>,
  Array<ElisaWellPost>,
  { rejectValue: { apiRejection: APIRejection } }
>("elisaWells/postElisaWells", (post, { rejectWithValue }) =>
  postAPI<Array<ElisaWellPost>, Array<ElisaWell>>("elisa_well", post).catch(
    (apiRejection) => rejectWithValue({ apiRejection: apiRejection })
  )
);

export const putElisaWell = createAsyncThunk<
  ElisaWell,
  ElisaWellPost,
  { rejectValue: { apiRejection: APIRejection } }
>("elisaWells/putElisaWell", (post, { rejectWithValue }) =>
  putAPI<ElisaWellPost, ElisaWell>(
    `elisa_well/${serializeElisaWellRef(post)}`,
    post
  ).catch((apiRejection) => rejectWithValue({ apiRejection }))
);

const elisaWellSlice = createSlice({
  name: "elisaWells",
  initialState: initialElisaWellState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getElisaWells.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getElisaWells.fulfilled, (state, action) => {
      state.elisaWells = addUniqueByKeys(state.elisaWells, action.payload, [
        "project",
        "plate",
        "location",
      ]);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getElisaWells.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getElisaWell.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(
        action.meta.arg.elisaWellRef
      );
    });
    builder.addCase(getElisaWell.fulfilled, (state, action) => {
      state.elisaWells = addUniqueByKeys(
        state.elisaWells,
        [action.payload],
        ["project", "plate", "location"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg.elisaWellRef)
      );
    });
    builder.addCase(getElisaWell.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg.elisaWellRef)
      );
    });
    builder.addCase(postElisaWells.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postElisaWells.fulfilled, (state, action) => {
      state.elisaWells = addUniqueByKeys(state.elisaWells, action.payload, [
        "project",
        "plate",
        "location",
      ]);
      state.posted = state.posted.concat(action.payload);
      state.postPending = false;
    });
    builder.addCase(postElisaWells.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaWell.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(putElisaWell.fulfilled, (state, action) => {
      state.elisaWells = addUniqueByKeys(
        state.elisaWells,
        [action.payload],
        ["project", "plate", "location"]
      );
      state.posted = state.posted.concat({
        project: action.payload.project,
        plate: action.payload.plate,
        location: action.payload.location,
      });
      state.postPending = false;
    });
    builder.addCase(putElisaWell.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaPlate.fulfilled, (state, action) => {
      state.elisaWells = addUniqueByKeys(
        state.elisaWells,
        action.payload.elisaWells,
        ["project", "plate", "location"]
      );
    });
  },
});

export const elisaWellReducer = elisaWellSlice.reducer;

export const selectElisaWells = (state: RootState) =>
  state.elisaWells.elisaWells;
export const selectElisaWell =
  (elisaWellRef: ElisaWellRef) => (state: RootState) =>
    state.elisaWells.elisaWells.find((elisaWell) =>
      partialEq(elisaWell, elisaWellRef)
    );
export const selectLoadingElisaWell = (state: RootState) =>
  state.elisaWells.allFetched === AllFetched.Pending ||
  Boolean(state.elisaWells.fetchPending.length);
