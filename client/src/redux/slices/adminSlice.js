import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  projects: [],
  tasks: [],

  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",

  initialState,

  reducers: {
    setAdminUsers: (state, action) => {
      state.users = action.payload;
    },

    setAdminProjects: (state, action) => {
      state.projects = action.payload;
    },

    setAdminTasks: (state, action) => {
      state.tasks = action.payload;
    },

    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAdminError: (state, action) => {
      state.error = action.payload;
    },

    clearAdminData: (state) => {
      state.users = [];
      state.projects = [];
      state.tasks = [];
      state.error = null;
    },
  },
});

export const {
  setAdminUsers,
  setAdminProjects,
  setAdminTasks,
  setAdminLoading,
  setAdminError,
  clearAdminData,
} = adminSlice.actions;

export default adminSlice.reducer;
