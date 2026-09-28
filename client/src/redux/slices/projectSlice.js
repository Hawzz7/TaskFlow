import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    limit: 6,
    totalProjects: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const projectSlice = createSlice({
  name: "project",
  initialState,

  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },

    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    setProjectLoading: (state, action) => {
      state.loading = action.payload;
    },

    setProjectError: (state, action) => {
      state.error = action.payload;
    },

    clearProjectError: (state) => {
      state.error = null;
    },

    clearProjects: (state) => {
      state.projects = [];
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    setProjectPagination: (state, action) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  setProjectLoading,
  setProjectError,
  clearProjectError,
  clearProjects,
  setCurrentProject,
  setProjectPagination
} = projectSlice.actions;

export default projectSlice.reducer;
