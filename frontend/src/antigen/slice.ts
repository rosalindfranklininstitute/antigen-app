import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAPI, postAPI, APIRejection } from "../utils/api";
import {
  addUniqueUUID,
  AllFetched,
  filterUUID,
} from "../utils/state_management";
import {
  Antigen,
  LocalAntigen,
  UniProtAntigen,
  UniProtAntigenPost,
  LocalAntigenPost,
} from "./utils";

type AntigenState = {
  antigens: Antigen[];
  allFetched: AllFetched;
  fetchPending: string[];
  postedUniProt: string[];
  postedLocal: string[];
  postPending: boolean;
};

const initialAntigenState: AntigenState = {
  antigens: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  postedUniProt: [],
  postedLocal: [],
  postPending: false,
};

export const getAntigens = createAsyncThunk<
  Antigen[],
  void,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "antigens/getAntigens",
  (_, { rejectWithValue }) =>
    getAPI<Antigen[]>("antigen").catch((apiRejection) =>
      rejectWithValue({ apiRejection: apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().antigens.allFetched === AllFetched.False,
  }
);

export const getAntigen = createAsyncThunk<
  Antigen,
  string,
  {
    state: RootState;
    rejectValue: { uuid: string; apiRejection: APIRejection };
  }
>(
  "antigens/getAntigen",
  async (uuid: string, { rejectWithValue }) =>
    getAPI<Antigen>(`antigen/${uuid}`).catch((apiRejection) =>
      rejectWithValue({ uuid, apiRejection })
    ),
  {
    condition: (uuid, { getState }) =>
      !(
        getState().antigens.antigens.filter((antigen) => antigen.uuid === uuid)
          .length > 0 ||
        getState().antigens.fetchPending.filter((antigen) => antigen === uuid)
          .length > 0
      ),
  }
);

export const postUniProtAntigen = createAsyncThunk<
  Antigen,
  UniProtAntigenPost,
  { rejectValue: { apiRejection: APIRejection } }
>("antigens/addUniProt", (post, { rejectWithValue }) =>
  postAPI<UniProtAntigenPost, UniProtAntigen>("uniprot_antigen", post).then(
    (uniProtAntigen) =>
      getAPI<Antigen>(`antigen/${uniProtAntigen.antigen}`).catch(
        (apiRejection) => rejectWithValue({ apiRejection })
      ),
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

export const postLocalAntigen = createAsyncThunk<
  Antigen,
  LocalAntigenPost,
  { rejectValue: { apiRejection: APIRejection } }
>("antigens/addLocal", (post, { rejectWithValue }) =>
  postAPI<LocalAntigenPost, LocalAntigen>("local_antigen", post).then(
    (localAntigen) =>
      getAPI<Antigen>(`antigen/${localAntigen.antigen}`).catch((apiRejection) =>
        rejectWithValue({ apiRejection })
      ),
    (apiRejection) => rejectWithValue({ apiRejection })
  )
);

const antigenSlice = createSlice({
  name: "anitgen",
  initialState: initialAntigenState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAntigens.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getAntigens.fulfilled, (state, action) => {
      state.antigens = addUniqueUUID(state.antigens, action.payload);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getAntigens.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getAntigen.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueUUID(state.antigens, [action.payload]);
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload.uuid
      );
    });
    builder.addCase(getAntigen.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (uuid) => uuid !== action.payload?.uuid
      );
    });
    builder.addCase(postUniProtAntigen.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postUniProtAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueUUID(state.antigens, [action.payload]);
      state.postedUniProt = state.postedUniProt.concat(action.payload.uuid);
      state.postPending = false;
    });
    builder.addCase(postUniProtAntigen.rejected, (state, action) => {
      state.postPending = false;
    });
    builder.addCase(postLocalAntigen.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postLocalAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueUUID(state.antigens, [action.payload]);
      state.postedLocal = state.postedLocal.concat(action.payload.uuid);
      state.postPending = false;
    });
    builder.addCase(postLocalAntigen.rejected, (state, action) => {
      state.postPending = false;
    });
  },
});

export const antigenReducer = antigenSlice.reducer;

export const selectAntigens = (state: RootState) => state.antigens.antigens;
export const selectAntigen = (uuid: string) => (state: RootState) =>
  state.antigens.antigens.find((antigen) => antigen.uuid === uuid);
export const selectLoadingAntigen = (state: RootState) =>
  state.antigens.allFetched === AllFetched.Pending ||
  Boolean(state.antigens.fetchPending.length);
export const selectPostedUniProtAntigens = (state: RootState) =>
  filterUUID(state.antigens.antigens, state.antigens.postedUniProt);
export const selectPostedLocalAntignes = (state: RootState) =>
  filterUUID(state.antigens.antigens, state.antigens.postedLocal);
