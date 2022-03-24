import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAPI, postAPI, APIRejection } from "../utils/api";
import { mergeByKeys, intersectKeys, keyEq } from "../utils/state_management";
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
  fetched: Array<Partial<AntigenRef> & { plate?: number }>;
  fetchPending: Array<Partial<AntigenRef> & { plate?: number }>;
  postedUniProt: Array<AntigenRef>;
  postedLocal: Array<AntigenRef>;
  postPending: boolean;
};

const initialAntigenState: AntigenState = {
  antigens: [],
  fetched: [],
  fetchPending: [],
  postedUniProt: [],
  postedLocal: [],
  postPending: false,
};

export const getAntigens = createAsyncThunk<
  Antigen[],
  Partial<Pick<AntigenRef, "project">> & { plate?: number },
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "antigens/getAntigens",
  (params, { rejectWithValue }) =>
    getAPI<Antigen[]>("antigen", params).catch((apiRejection) =>
      rejectWithValue({ apiRejection: apiRejection })
    ),
  {
    condition: (params, { getState }) =>
      !getState()
        .antigens.fetched.concat(getState().antigens.fetchPending)
        .some((got) => keyEq(got, params, ["project", "plate"])),
  }
);

export const getAntigen = createAsyncThunk<
  Antigen,
  AntigenRef & { plate?: number },
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
      !getState()
        .antigens.fetched.concat(getState().antigens.fetchPending)
        .some(
          (got) =>
            keyEq(
              { project: antigenRef.project, number: antigenRef.number },
              got,
              ["project", "number"]
            ) ||
            keyEq(
              { project: antigenRef.project, plate: antigenRef.plate },
              got,
              ["project", "plate"]
            )
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
    builder.addCase(getAntigens.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getAntigens.fulfilled, (state, action) => {
      state.antigens = mergeByKeys(state.antigens, action.payload, [
        "project",
        "number",
      ]);
      state.fetchPending = state.fetchPending.filter(
        (pending) => !keyEq(pending, action.meta.arg, ["project", "plate"])
      );
      state.fetched = state.fetched.concat(action.meta.arg);
    });
    builder.addCase(getAntigens.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => !keyEq(pending, action.meta.arg, ["project", "plate"])
      );
    });
    builder.addCase(getAntigen.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getAntigen.fulfilled, (state, action) => {
      state.antigens = mergeByKeys(
        state.antigens,
        [action.payload],
        ["project", "number"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) =>
          !keyEq(action.meta.arg, pending, ["project", "number"]) ||
          !keyEq(action.meta.arg, pending, ["project", "plate"])
      );
      state.fetched = state.fetched.concat(action.meta.arg);
    });
    builder.addCase(getAntigen.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) =>
          !keyEq(action.meta.arg, pending, ["project", "number"]) ||
          !keyEq(action.meta.arg, pending, ["project", "plate"])
      );
    });
    builder.addCase(postUniProtAntigen.pending, (state) => {
      state.postPending = true;
    });
    builder.addCase(postUniProtAntigen.fulfilled, (state, action) => {
      state.antigens = mergeByKeys(
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
      state.antigens = mergeByKeys(
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
  state.antigens.antigens.find((antigen) =>
    keyEq(antigen, antigenRef, ["project", "number"])
  );
export const selectLoadingAntigen = (state: RootState) =>
  state.antigens.fetchPending.length > 0 || state.antigens.postPending;
export const selectPostedUniProtAntigens = (state: RootState) =>
  intersectKeys(state.antigens.antigens, state.antigens.postedUniProt, [
    "project",
    "number",
  ]);
export const selectPostedLocalAntignes = (state: RootState) =>
  intersectKeys(state.antigens.antigens, state.antigens.postedLocal, [
    "project",
    "number",
  ]);
