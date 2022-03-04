import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { putElisaPlate } from "../elisa_plate/slice";
import { RootState } from "../store";
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

export const getElisaWells = createAsyncThunk<
  Array<ElisaWell>,
  void,
  { state: RootState }
>(
  "elisaWells/getElisaWells",
  async () => await getAPI<Array<ElisaWell>>("elisa_well"),
  {
    condition: (_, { getState }) =>
      getState().elisaWells.allFetched === AllFetched.False,
  }
);

export const getElisaWell = createAsyncThunk<
  ElisaWell,
  ElisaWellKey & { force?: boolean },
  { state: RootState }
>(
  "elisaWells/getElisaWell",
  async ({ plate, location }) =>
    await getAPI<ElisaWell>(`elisa_well/${plate}:${location}`),
  {
    condition: ({ plate, location, force }, { getState }) =>
      force ||
      (getState().elisaWells.elisaWells.filter(
        (elisaWell) =>
          elisaWell.plate === plate && elisaWell.location === location
      ).length === 0 &&
        getState().elisaWells.fetchPending.filter(
          (key) => key.plate === plate && key.location === location
        ).length === 0),
  }
);

export const postElisaWell = createAsyncThunk<ElisaWell, ElisaWellPost>(
  "elisaWells/postElisaWell",
  async (post) => await postAPI<ElisaWellPost, ElisaWell>("elisa_well", post)
);

export const putElisaWell = createAsyncThunk<ElisaWell, ElisaWellPost>(
  "elisaWells/putElisaWell",
  async (post) =>
    await putAPI<ElisaWellPost, ElisaWell>(
      `elisa_well/${post.plate}:${post.location}`,
      post
    )
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
      state.elisaWells = addUniqueUUID(state.elisaWells, action.payload);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getElisaWells.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getElisaWell.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getElisaWell.fulfilled, (state, action) => {
      state.elisaWells = addUniqueUUID(state.elisaWells, [action.payload]);
      state.fetchPending = state.fetchPending.filter(
        (key) =>
          key !==
          { plate: action.payload.plate, location: action.payload.location }
      );
    });
    builder.addCase(getElisaWell.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (key) =>
          key !==
          { plate: action.meta.arg.plate, location: action.meta.arg.location }
      );
    });
    builder.addCase(postElisaWell.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postElisaWell.fulfilled, (state, action) => {
      state.elisaWells = addUniqueUUID(state.elisaWells, [action.payload]);
      state.posted = state.posted.concat({
        plate: action.payload.plate,
        location: action.payload.location,
      });
      state.postPending = false;
    });
    builder.addCase(postElisaWell.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaWell.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(putElisaWell.fulfilled, (state, action) => {
      state.elisaWells = addUniqueUUID(state.elisaWells, [action.payload]);
      state.posted = state.posted.concat({
        plate: action.payload.plate,
        location: action.payload.location,
      });
      state.postPending = false;
    });
    builder.addCase(putElisaWell.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaPlate.fulfilled, (state, action) => {
      state.elisaWells = addUniqueUUID(
        state.elisaWells,
        action.payload.elisaWells
      );
    });
  },
});

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
