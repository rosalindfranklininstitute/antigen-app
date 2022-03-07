import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ElisaWell } from "../elisa_well/utils";
import { RootState } from "../store";
import { APIRejection, getAPI, postAPI, putAPI } from "../utils/api";
import { addUniqueUUID, AllFetched } from "../utils/state_management";
import { ElisaPlate, ElisaPlatePost } from "./utils";

type ElisaPlateState = {
  elisaPlates: ElisaPlate[];
  allFetched: AllFetched;
  fetchPending: string[];
  posted: string[];
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
  void,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "elisaPlates/getElisaPlates",
  (_, { rejectWithValue }) =>
    getAPI<Array<ElisaPlate>>("elisa_plate").catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().elisaPlates.allFetched === AllFetched.False,
  }
);

export const getElisaPlate = createAsyncThunk<
  ElisaPlate,
  string,
  {
    state: RootState;
    rejectValue: { uuid: string; apiRejection: APIRejection };
  }
>(
  "elisaPlates/getElisaPlate",
  (uuid: string, { rejectWithValue }) =>
    getAPI<ElisaPlate>(`elisa_plate/${uuid}`).catch((apiRejection) =>
      rejectWithValue({ uuid, apiRejection })
    ),
  {
    condition: (uuid, { getState }) =>
      getState().elisaPlates.elisaPlates.filter(
        (elisaPlates) => elisaPlates.uuid === uuid
      ).length === 0 &&
      getState().elisaPlates.fetchPending.filter(
        (elisaPlates) => elisaPlates === uuid
      ).length === 0,
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
  ElisaPlatePost & { uuid: string },
  { rejectValue: { apiRejection: APIRejection } }
>("elisaPlates", (post, { rejectWithValue }) =>
  putAPI<ElisaPlatePost, ElisaPlate>(`elisa_plate/${post.uuid}`, post).then(
    async (elisaPlate) => ({
      elisaPlate,
      elisaWells: await Promise.all(
        elisaPlate.plate_elisa_wells.map((location) =>
          getAPI<ElisaWell>(`elisa_well/${elisaPlate.uuid}:${location}`)
        )
      ),
    }),
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

const elisaPlateSlice = createSlice({
  name: "elisaPlates",
  initialState: initialElisaPlateState,
  reducers: {
    postPending: (state) => ({
      ...state,
      postPending: true,
    }),
    postSuccess: (state, action: PayloadAction<ElisaPlate>) => ({
      ...state,
      postPending: false,
      elisaPlates: addUniqueUUID(state.elisaPlates, [action.payload]),
      posted: state.posted.concat(action.payload.uuid),
    }),
    postFail: (state, action: PayloadAction<string>) => ({
      ...state,
      postPending: false,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(getElisaPlates.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getElisaPlates.fulfilled, (state, action) => {
      state.elisaPlates = addUniqueUUID(state.elisaPlates, action.payload);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getElisaPlates.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getElisaPlate.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = addUniqueUUID(state.elisaPlates, [action.payload]);
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload.uuid
      );
    });
    builder.addCase(getElisaPlate.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload?.uuid
      );
    });
    builder.addCase(postElisaPlate.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = addUniqueUUID(state.elisaPlates, [action.payload]);
      state.posted = state.posted.concat(action.payload.uuid);
      state.postPending = false;
    });
    builder.addCase(postElisaPlate.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(putElisaPlate.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(putElisaPlate.fulfilled, (state, action) => {
      state.elisaPlates = addUniqueUUID(state.elisaPlates, [
        action.payload.elisaPlate,
      ]);
      state.posted = state.posted.concat(action.payload.elisaPlate.uuid);
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
export const selectElisaPlate = (uuid: string) => (state: RootState) =>
  state.elisaPlates.elisaPlates.find((elisaPlate) => elisaPlate.uuid === uuid);
export const selectLoadingElisaPlate = (state: RootState) =>
  state.elisaPlates.allFetched === AllFetched.Pending ||
  Boolean(state.elisaPlates.fetchPending.length);
