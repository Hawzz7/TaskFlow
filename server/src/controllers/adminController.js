import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";


// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};


// GET ALL PROJECTS
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get all projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};


// GET ALL TASKS
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
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
    console.error("Get all tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tasks",
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [users, projects, tasks] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users,
        projects,
        tasks,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin statistics",
    });
  }
};