import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,

  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },

    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },

    updateTask: (state, action) => {
      const updatedTask = action.payload;

      const index = state.tasks.findIndex(
        (task) => task._id === updatedTask._id,
      );

      if (index !== -1) {
        state.tasks[index] = updatedTask;
      }

      if (state.currentTask?._id === updatedTask._id) {
        state.currentTask = updatedTask;
      }
    },

    removeTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);

      if (state.currentTask?._id === action.payload) {
        state.currentTask = null;
      }
    },

    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },

    setTaskLoading: (state, action) => {
      state.loading = action.payload;
    },

    setTaskError: (state, action) => {
      state.error = action.payload;
    },

    clearTaskError: (state) => {
      state.error = null;
    },

    clearTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setCurrentTask,
  setTaskLoading,
  setTaskError,
  clearTaskError,
  clearTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
