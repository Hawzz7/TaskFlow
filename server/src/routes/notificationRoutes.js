import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getNotifications);

notificationRouter.get("/unread-count", protect, getUnreadNotificationCount);

notificationRouter.patch(
  "/:notificationId/read",
  protect,
  markNotificationAsRead,
);

notificationRouter.patch("/read-all", protect, markAllNotificationsAsRead);

export default notificationRouter;
