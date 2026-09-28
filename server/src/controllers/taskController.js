import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignee } =
      req.body;

    // Check whether the project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check whether the logged-in user belongs to the project
    const isMember = existingProject.members.some(
      (memberId) => memberId.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // If an assignee is provided, make sure the assignee
    // is also a member of the project
    if (assignee) {
      const isAssigneeMember = existingProject.members.some(
        (memberId) => memberId.toString() === assignee.toString(),
      );

      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of the project",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignee: assignee || null,
      createdBy: req.user._id,
    });

    const populatedTask = await task.populate([
      {
        path: "project",
        select: "name status priority",
      },
      {
        path: "assignee",
        select: "name email role",
      },
      {
        path: "createdBy",
        select: "name email role",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create task",
    });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get project tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project tasks",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("project", "name status priority members")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = task.project;

    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check whether the project exists
    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check whether the logged-in user belongs to the project
    const isMember = project.members.some(
      (memberId) =>
        memberId.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
    } = req.body;

    // If an assignee is provided, make sure they belong to the project
    if (assignee) {
      const isAssigneeMember = project.members.some(
        (memberId) =>
          memberId.toString() === assignee.toString(),
      );

      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of the project",
        });
      }
    }

    // Update only fields that were actually provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) {
      task.description = description;
    }
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignee !== undefined) {
      task.assignee = assignee || null;
    }

    await task.save();

    const populatedTask = await task.populate([
      {
        path: "project",
        select: "name status priority",
      },
      {
        path: "assignee",
        select: "name email role",
      },
      {
        path: "createdBy",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only the project owner can delete tasks
    const isProjectOwner =
      project.owner.toString() === req.user._id.toString();

    if (!isProjectOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete tasks",
      });
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete task",
    });
  }
};

// export const deleteTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     const task = await Task.findById(taskId);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     const project = await Project.findById(task.project);

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: "Project not found",
//       });
//     }

//     // Only project members can delete the task
//     const isMember = project.members.some(
//       (memberId) =>
//         memberId.toString() === req.user._id.toString(),
//     );

//     if (!isMember) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not a member of this project",
//       });
//     }

//     await Task.findByIdAndDelete(taskId);

//     return res.status(200).json({
//       success: true,
//       message: "Task deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete task error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to delete task",
//     });
//   }
// };

export const getDashboardTasks = async (req, res) => {
  try {
    // Find all projects where the logged-in user is a member
    const projects = await Project.find({
      members: req.user._id,
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    // Find tasks belonging to those projects
    const tasks = await Task.find({
      project: { $in: projectIds },
    })
      .populate("project", "name status priority")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get dashboard tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard tasks",
    });
  }
};