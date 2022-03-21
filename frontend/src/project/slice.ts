import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { APIRejection, getAPI, postAPI } from "../utils/api";
import {
  addUniqueByKeys,
  AllFetched,
  filterPartial,
  partialEq,
} from "../utils/state_management";
import { Project, ProjectRef, ProjectPost } from "./utils";

type ProjectState = {
  current: ProjectRef | undefined;
  projects: Project[];
  allFetched: AllFetched;
  fetchPending: ProjectRef[];
  posted: ProjectRef[];
  postPending: ProjectRef[];
};

const initialProjectState: ProjectState = {
  current: undefined,
  projects: [],
  allFetched: AllFetched.False,
  fetchPending: [],
  posted: [],
  postPending: [],
};

export const getProjects = createAsyncThunk<
  Array<Project>,
  void,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "projects/getProjects",
  (_, { rejectWithValue }) =>
    getAPI<Array<Project>>("project", {}).catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (_, { getState }) =>
      getState().projects.allFetched === AllFetched.False,
  }
);

export const getProject = createAsyncThunk<
  Project,
  ProjectRef,
  { state: RootState; rejectValue: { apiRejection: APIRejection } }
>(
  "projects/getProject",
  (projectRef, { rejectWithValue }) =>
    getAPI<Project>(`project/${projectRef}`, {}).catch((apiRejection) =>
      rejectWithValue({ apiRejection })
    ),
  {
    condition: (projectRef, { getState }) =>
      filterPartial(getState().projects.projects, { short_title: projectRef })
        .length === 0 &&
      filterPartial(getState().projects.fetchPending, projectRef).length === 0,
  }
);

export const postProject = createAsyncThunk<
  Project,
  ProjectPost,
  { rejectValue: { apiRejection: APIRejection } }
>("projects/postProject", (post, { rejectWithValue }) =>
  postAPI<ProjectPost, Project>("project", post).catch((apiRejection) =>
    rejectWithValue({ apiRejection })
  )
);

const projectSlice = createSlice({
  name: "project",
  initialState: initialProjectState,
  reducers: {
    switch(state, action: PayloadAction<ProjectRef>) {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjects.pending, (state) => {
      state.allFetched = AllFetched.Pending;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.projects = addUniqueByKeys(state.projects, action.payload, [
        "short_title",
      ]);
      state.allFetched = AllFetched.True;
    });
    builder.addCase(getProjects.rejected, (state) => {
      state.allFetched = AllFetched.False;
    });
    builder.addCase(getProject.pending, (state, action) => {
      state.fetchPending = state.fetchPending.concat(action.meta.arg);
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.projects = addUniqueByKeys(
        state.projects,
        [action.payload],
        ["short_title"]
      );
      state.fetchPending = filterPartial(
        state.fetchPending,
        action.payload.short_title
      );
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.fetchPending = filterPartial(state.fetchPending, action.meta.arg);
    });
    builder.addCase(postProject.pending, (state, action) => {
      state.postPending.concat(action.meta.arg.short_title);
    });
    builder.addCase(postProject.fulfilled, (state, action) => {
      state.projects = addUniqueByKeys(
        state.projects,
        [action.payload],
        ["short_title"]
      );
      state.posted = state.posted.concat(action.payload.short_title);
      state.postPending = filterPartial(
        state.postPending,
        action.meta.arg.short_title
      );
    });
    builder.addCase(postProject.rejected, (state, action) => {
      state.postPending = filterPartial(
        state.postPending,
        action.meta.arg.short_title
      );
    });
  },
});

export const { switch: switchProject } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectProject = (projectRef: ProjectRef) => (state: RootState) =>
  state.projects.projects.find((project) =>
    partialEq(project, { short_title: projectRef })
  );
export const selectCurrentProject = (state: RootState) =>
  state.projects.current;
export const selectLoadingProject = (state: RootState) =>
  state.projects.allFetched === AllFetched.Pending ||
  Boolean(state.projects.fetchPending.length);
export const selectPostedProjects = (state: RootState) =>
  state.projects.posted.flatMap((posted) =>
    filterPartial(state.projects.projects, { short_title: posted })
  );
