import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAPI, postAPI, APIRejection } from "../utils/api";
import {
  addUniqueByKeys,
  AllFetched,
  filterPartial,
  intersectPartial,
  partialEq,
} from "../utils/state_management";
import {
  Antigen,
  LocalAntigen,
  UniProtAntigen,
  UniProtAntigenPost,
  LocalAntigenPost,
  AntigenRef,
} from "./utils";

type AntigenState = {
  antigens: Array<Antigen>;
  allFetched: AllFetched;
  fetchPending: Array<AntigenRef>;
  postedUniProt: Array<AntigenRef>;
  postedLocal: Array<AntigenRef>;
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
  Partial<Pick<AntigenRef, "project">> | { plate?: number },
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "antigens/getAntigens",
  (params, { rejectWithValue }) =>
    getAPI<Antigen[]>("antigen", params).catch((apiRejection) =>
      rejectWithValue({ apiRejection: apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().antigens.allFetched === AllFetched.False,
  }
);

export const getAntigen = createAsyncThunk<
  Antigen,
  AntigenRef,
  {
    state: RootState;
    rejectValue: { antigenRef: AntigenRef; apiRejection: APIRejection };
  }
>(
  "antigens/getAntigen",
  async (antigenRef, { rejectWithValue }) =>
    getAPI<Antigen>(
      `antigen/${antigenRef.project}:${antigenRef.number}`,
      {}
    ).catch((apiRejection) =>
      rejectWithValue({ antigenRef: antigenRef, apiRejection })
    ),
  {
    condition: (antigenRef, { getState }) =>
      filterPartial(getState().antigens.antigens, antigenRef).length === 0 &&
      filterPartial(getState().antigens.fetchPending, antigenRef).length === 0,
  }
);

export const postUniProtAntigen = createAsyncThunk<
  Antigen,
  UniProtAntigenPost,
  { rejectValue: { apiRejection: APIRejection } }
>("antigens/addUniProt", (post, { rejectWithValue }) =>
  postAPI<UniProtAntigenPost, UniProtAntigen>("uniprot_antigen", post).then(
    (uniProtAntigen) =>
      getAPI<Antigen>(
        `antigen/${uniProtAntigen.project}:${uniProtAntigen.number}`,
        {}
      ).catch((apiRejection) => rejectWithValue({ apiRejection })),
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
      getAPI<Antigen>(
        `antigen/${localAntigen.project}:${localAntigen.number}`,
        {}
      ).catch((apiRejection) => rejectWithValue({ apiRejection })),
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
      state.antigens = addUniqueByKeys(state.antigens, action.payload, [
        "project",
        "number",
      ]);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getAntigens.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getAntigen.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueByKeys(
        state.antigens,
        [action.payload],
        ["project", "number"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg)
      );
    });
    builder.addCase(getAntigen.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !partialEq(pending, action.meta.arg)
      );
    });
    builder.addCase(postUniProtAntigen.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postUniProtAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueByKeys(
        state.antigens,
        [action.payload],
        ["project", "number"]
      );
      state.postedUniProt = state.postedUniProt.concat(action.payload);
      state.postPending = false;
    });
    builder.addCase(postUniProtAntigen.rejected, (state) => {
      state.postPending = false;
    });
    builder.addCase(postLocalAntigen.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postLocalAntigen.fulfilled, (state, action) => {
      state.antigens = addUniqueByKeys(
        state.antigens,
        [action.payload],
        ["project", "number"]
      );
      state.postedLocal = state.postedLocal.concat(action.payload);
      state.postPending = false;
    });
    builder.addCase(postLocalAntigen.rejected, (state) => {
      state.postPending = false;
    });
  },
});

export const antigenReducer = antigenSlice.reducer;

export const selectAntigens = (state: RootState) => state.antigens.antigens;
export const selectAntigen = (antigenRef: AntigenRef) => (state: RootState) =>
  state.antigens.antigens.find((antigen) => partialEq(antigen, antigenRef));
export const selectLoadingAntigen = (state: RootState) =>
  state.antigens.allFetched === AllFetched.Pending ||
  Boolean(state.antigens.fetchPending.length);
export const selectPostedUniProtAntigens = (state: RootState) =>
  intersectPartial(state.antigens.antigens, state.antigens.postedUniProt);
export const selectPostedLocalAntignes = (state: RootState) =>
  intersectPartial(state.antigens.antigens, state.antigens.postedLocal);
