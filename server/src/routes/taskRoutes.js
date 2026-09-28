import express from "express";

import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardTasks,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";

const taskRouter = express.Router();

taskRouter.post("/", protect, createTask);

taskRouter.get("/project/:projectId", protect, getProjectTasks);

taskRouter.get("/dashboard", protect, getDashboardTasks);

taskRouter.get("/:taskId", protect, getTaskById);

taskRouter.patch("/:taskId", protect, updateTask);

taskRouter.delete("/:taskId", protect, deleteTask);

export default taskRouter;
