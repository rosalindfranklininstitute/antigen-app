import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { APIRejection, getAPI, postAPI } from "../utils/api";
import {
  mergeByKeys,
  AllFetched,
  filterKeys,
  keyEq,
} from "../utils/state_management";
import { Project, ProjectRef, ProjectPost } from "./utils";

type ProjectState = {
  current: ProjectRef | null;
  projects: Project[];
  allFetched: AllFetched;
  fetchPending: ProjectRef[];
  posted: ProjectRef[];
  postPending: ProjectRef[];
};

const initialProjectState: ProjectState = {
  current: null,
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
      filterKeys(getState().projects.projects, { short_title: projectRef }, [
        "short_title",
      ]).length === 0 &&
      !getState().projects.fetchPending.some(
        (pending) => pending === projectRef
      ),
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
      state.projects = mergeByKeys(state.projects, action.payload, [
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
      state.projects = mergeByKeys(
        state.projects,
        [action.payload],
        ["short_title"]
      );
      state.fetchPending = state.fetchPending.filter(
        (pending) => pending === action.meta.arg
      );
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.fetchPending = state.fetchPending.filter(
        (pending) => pending === action.meta.arg
      );
    });
    builder.addCase(postProject.pending, (state, action) => {
      state.postPending.concat(action.meta.arg.short_title);
    });
    builder.addCase(postProject.fulfilled, (state, action) => {
      state.projects = mergeByKeys(
        state.projects,
        [action.payload],
        ["short_title"]
      );
      state.posted = state.posted.concat(action.payload.short_title);
      state.postPending = state.postPending.filter(
        (pending) => pending === action.meta.arg.short_title
      );
    });
    builder.addCase(postProject.rejected, (state, action) => {
      state.postPending = state.postPending.filter(
        (pending) => pending === action.meta.arg.short_title
      );
    });
  },
});

export const { switch: switchProject } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectProject = (projectRef: ProjectRef) => (state: RootState) =>
  state.projects.projects.find((project) =>
    keyEq(project, { short_title: projectRef }, ["short_title"])
  );
export const selectCurrentProject = (state: RootState) => {
  return (
    state.projects.projects.find(
      (project) => project.short_title === state.projects.current
    ) || null
  );
};
export const selectLoadingProject = (state: RootState) =>
  state.projects.allFetched === AllFetched.Pending ||
  Boolean(state.projects.fetchPending.length);
export const selectPostedProjects = (state: RootState) =>
  state.projects.posted.flatMap((posted) =>
    filterKeys(state.projects.projects, { short_title: posted }, [
      "short_title",
    ])
  );
