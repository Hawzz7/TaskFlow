import express from "express";

import {
  getAdminStats,
  getAllUsers,
  getAllProjects,
  getAllTasks,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", protect, isAdmin, getAdminStats);


// Users
router.get("/users", protect, isAdmin, getAllUsers);


// Projects
router.get("/projects", protect, isAdmin, getAllProjects);


// Tasks
router.get("/tasks", protect, isAdmin, getAllTasks);


export default router;