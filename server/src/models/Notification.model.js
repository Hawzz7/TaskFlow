import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["PROJECT_MEMBER_ADDED", "TASK_OVERDUE"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Prevent duplicate notifications for the same
 * recipient + notification type + task.
 *
 * This is especially important for overdue tasks because
 * our scheduled job may detect the same overdue task
 * multiple times.
 */
notificationSchema.index(
  {
    recipient: 1,
    type: 1,
    task: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "TASK_OVERDUE",
      task: { $exists: true },
    },
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
