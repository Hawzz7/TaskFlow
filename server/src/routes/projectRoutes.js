import express from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  getProjectStatistics,
} from "../controllers/projectController.js";

import { protect } from "../middleware/authMiddleware.js";

const projectRouter = express.Router();

projectRouter.post("/", protect, createProject);

projectRouter.get("/", protect, getProjects);

projectRouter.get("/statistics", protect, getProjectStatistics);

projectRouter.get("/:projectId", protect, getProjectById);

projectRouter.patch("/:projectId", protect, updateProject);

projectRouter.post("/:projectId/members", protect, addProjectMember);

projectRouter.delete(
  "/:projectId/members/:memberId",
  protect,
  removeProjectMember,
);

export default projectRouter;
