import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import Task from "../models/Task.model.js"

export const createProject = async (req, res) => {
  try {
    const { name, description, status, priority, startDate, dueDate } =
      req.body;

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      owner: req.user._id,
      members: [req.user._id],
    });

    const populatedProject = await project.populate("owner", "name email role");

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create project",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);

    const skip = (page - 1) * limit;

    const projectFilter = {
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    };

    const [projects, totalProjects] = await Promise.all([
      Project.find(projectFilter)
        .populate("owner", "name email role")
        .populate("members", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Project.countDocuments(projectFilter),
    ]);

    // Calculate task progress for the projects
    // displayed on the current page.
    const projectIds = projects.map((project) => project._id);

    const taskStats = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
        },
      },
      {
        $group: {
          _id: "$project",

          totalTasks: {
            $sum: 1,
          },

          completedTasks: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Convert task statistics into a Map
    // so we can quickly attach them to each project.
    const taskStatsMap = new Map(
      taskStats.map((stat) => [
        stat._id.toString(),
        {
          totalTasks: stat.totalTasks,
          completedTasks: stat.completedTasks,
          progress:
            stat.totalTasks === 0
              ? 0
              : Math.round(
                  (stat.completedTasks / stat.totalTasks) * 100,
                ),
        },
      ]),
    );

    // Add task statistics to every project.
    const projectsWithProgress = projects.map((project) => {
      const stats = taskStatsMap.get(project._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
      };

      return {
        ...project.toObject(),
        taskStats: stats,
      };
    });

    const totalPages = Math.ceil(totalProjects / limit);

    return res.status(200).json({
      success: true,

      projects: projectsWithProgress,

      pagination: {
        currentPage: page,
        limit,
        totalProjects,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};
// export const getProjects = async (req, res) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);

//     const skip = (page - 1) * limit;

//     const projectFilter = {
//       $or: [{ owner: req.user._id }, { members: req.user._id }],
//     };

//     const [projects, totalProjects] = await Promise.all([
//       Project.find(projectFilter)
//         .populate("owner", "name email role")
//         .populate("members", "name email role")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       Project.countDocuments(projectFilter),
//     ]);

//     const totalPages = Math.ceil(totalProjects / limit);

//     return res.status(200).json({
//       success: true,
//       projects,
//       pagination: {
//         currentPage: page,
//         limit,
//         totalProjects,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPreviousPage: page > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Get projects error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch projects",
//     });
//   }
// };

export const getProjectStatistics = async (req, res) => {
  try {
    const projectFilter = {
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    };

    const [totalProjects, inProgressProjects, completedProjects] =
      await Promise.all([
        Project.countDocuments(projectFilter),

        Project.countDocuments({
          ...projectFilter,
          status: "IN_PROGRESS",
        }),

        Project.countDocuments({
          ...projectFilter,
          status: "COMPLETED",
        }),
      ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalProjects,
        inProgressProjects,
        completedProjects,
      },
    });
  } catch (error) {
    console.error("Get project statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project statistics",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only the project owner can edit the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can edit this project",
      });
    }

    const { name, description, status, priority, startDate, dueDate } =
      req.body;

    // Update only fields that were actually provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();

    const populatedProject = await project.populate([
      {
        path: "owner",
        select: "name email role",
      },
      {
        path: "members",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update project",
    });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Member email is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only the project owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can add members",
      });
    }

    // Find user by email
    const member = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Check whether user is already a member
    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === member._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    project.members.push(member._id);

    await project.save();

    const populatedProject = await project.populate([
      {
        path: "owner",
        select: "name email role",
      },
      {
        path: "members",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Add project member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add project member",
    });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only the project owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can remove members",
      });
    }

    // Owner cannot remove themselves
    if (project.owner.toString() === memberId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Project owner cannot be removed",
      });
    }

    const isMember = project.members.some(
      (existingMemberId) => existingMemberId.toString() === memberId.toString(),
    );

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project",
      });
    }

    project.members = project.members.filter(
      (existingMemberId) => existingMemberId.toString() !== memberId.toString(),
    );

    await project.save();

    const populatedProject = await project.populate([
      {
        path: "owner",
        select: "name email role",
      },
      {
        path: "members",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Remove project member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove project member",
    });
  }
};
