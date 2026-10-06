import Task from "../models/Task.model.js";
import Notification from "../models/Notification.model.js";

const createOverdueNotification = async ({
  recipient,
  task,
  project,
  message,
}) => {
  if (!recipient) return;

  try {
    await Notification.findOneAndUpdate(
      {
        recipient,
        type: "TASK_OVERDUE",
        task: task._id,
      },
      {
        $setOnInsert: {
          message,
          task: task._id,
          project: project._id,
          type: "TASK_OVERDUE",
          recipient,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } catch (error) {
    // Ignore duplicate notification errors
    if (error.code !== 11000) {
      console.error("Create overdue notification error:", error);
    }
  }
};

export const checkOverdueTasks = async () => {
  try {
    const now = new Date();

    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "COMPLETED" },
      overdueNotificationSent: false,
    })
      .populate("assignee", "name email")
      .populate("project", "name owner");

    for (const task of overdueTasks) {
      if (!task.project) continue;

      const projectOwner = task.project.owner;
      const assignee = task.assignee;

      // 1. Notify assigned user
      if (assignee) {
        await createOverdueNotification({
          recipient: assignee._id,
          task,
          project: task.project,
          message: `Task "${task.title}" in project "${task.project.name}" is overdue.`,
        });
      }

      // 2. Notify project owner
      // Avoid duplicate notification if owner is also the assignee
      if (
        projectOwner &&
        (!assignee || projectOwner.toString() !== assignee._id.toString())
      ) {
        const assigneeName =
          assignee?.name || assignee?.email || "an assigned user";

        await createOverdueNotification({
          recipient: projectOwner,
          task,
          project: task.project,
          message: `Task "${task.title}" is overdue and is assigned to ${assigneeName}.`,
        });
      }

      // Mark this overdue event as already notified
      task.overdueNotificationSent = true;
      await task.save();
    }

    if (overdueTasks.length > 0) {
      console.log(
        `Overdue task check completed: ${overdueTasks.length} overdue task(s) found.`,
      );
    }
  } catch (error) {
    console.error("Overdue task notification job error:", error);
  }
};

export const startOverdueTaskNotificationJob = () => {
  // Run once when the server starts
  checkOverdueTasks();

  // Check every minute
  setInterval(() => {
    checkOverdueTasks();
  }, 60 * 1000);

  console.log("Overdue task notification job started.");
};
