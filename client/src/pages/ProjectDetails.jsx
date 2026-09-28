import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  Users,
  AlertCircle,
  Plus,
  Pencil,
  SquarePen,
  UserPlus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";

import {
  setProjectLoading,
  setCurrentProject,
  setProjectError,
} from "../redux/slices/projectSlice";

import {
  setTasks,
  setTaskLoading,
  setTaskError,
  updateTask as updateTaskInStore,
  removeTask,
} from "../redux/slices/taskSlice";

import {
  getProjectById,
  removeProjectMember,
  updateProject,
} from "../services/projectServices";
import { getProjectTasks, deleteTask } from "../services/taskServices";

import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import AddProjectMemberModal from "../components/AddProjectMemberModal";
import EditProjectModal from "../components/EditProjectModal";

const statusStyles = {
  PLANNING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [selectedTask, setSelectedTask] = useState(null);

  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const [removingMemberId, setRemovingMemberId] = useState(null);

  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const { currentProject, loading, error } = useSelector(
    (state) => state.project,
  );

  const {
    tasks,
    loading: taskLoading,
    error: taskError,
  } = useSelector((state) => state.task);

  const isProjectOwner =
    currentProject?.owner?._id?.toString() === user?.id?.toString();

  // console.log("FULL CURRENT PROJECT:", currentProject);
  // console.log("PROJECT OWNER:", currentProject?.owner);
  // console.log("LOGGED IN USER:", user);
  // console.log("IS PROJECT OWNER:", isProjectOwner);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        dispatch(setProjectLoading(true));
        dispatch(setProjectError(null));

        const response = await getProjectById(projectId);

        dispatch(setCurrentProject(response.project));
      } catch (error) {
        console.error("Get project error:", error);

        dispatch(
          setProjectError(
            error.response?.data?.message || "Unable to load project",
          ),
        );
      } finally {
        dispatch(setProjectLoading(false));
      }
    };

    fetchProject();
  }, [projectId, dispatch]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        dispatch(setTaskLoading(true));
        dispatch(setTaskError(null));

        const response = await getProjectTasks(projectId);

        dispatch(setTasks(response.tasks));
      } catch (error) {
        console.error("Get project tasks error:", error);

        dispatch(
          setTaskError(error.response?.data?.message || "Unable to load tasks"),
        );
      } finally {
        dispatch(setTaskLoading(false));
      }
    };

    fetchTasks();
  }, [projectId, dispatch]);

  const handleProjectUpdated = (updatedProject) => {
    dispatch(setCurrentProject(updatedProject));
  };

  const handleRemoveMember = async (memberId) => {
    const member = currentProject.members?.find(
      (item) => item._id === memberId,
    );

    if (!member) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from this project?`,
    );

    if (!confirmed) return;

    try {
      setRemovingMemberId(memberId);

      const response = await removeProjectMember(projectId, memberId);

      dispatch(setCurrentProject(response.project));
    } catch (error) {
      console.error("Remove project member error:", error);

      dispatch(
        setProjectError(
          error.response?.data?.message || "Unable to remove project member.",
        ),
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleMemberAdded = (updatedProject) => {
    dispatch(setCurrentProject(updatedProject));
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    dispatch(updateTaskInStore(updatedTask));
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);

      await deleteTask(taskId);

      dispatch(removeTask(taskId));
    } catch (error) {
      console.error("Delete task error:", error);

      dispatch(
        setTaskError(error.response?.data?.message || "Unable to delete task."),
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      task.title?.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Project not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The project you're looking for could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={17} />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        type="button"
        onClick={() => navigate("/projects")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Back to Projects
      </motion.button>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FolderKanban size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {currentProject.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {currentProject.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                statusStyles[currentProject.status] ||
                "bg-slate-100 text-slate-600"
              }`}
            >
              {currentProject.status?.replace("_", " ")}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                priorityStyles[currentProject.priority] ||
                "bg-slate-100 text-slate-600"
              }`}
            >
              {currentProject.priority} Priority
            </span>

            {isProjectOwner && (
              <button
                type="button"
                onClick={() => setIsEditProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="mt-7 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-400">Start Date</p>

              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {formatDate(currentProject.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-400">Due Date</p>

              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {formatDate(currentProject.dueDate)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Members + Tasks */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={19} className="text-indigo-600" />

              <h2 className="font-semibold text-slate-900">Members</h2>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {currentProject.members?.length || 0}
              </span>
            </div>

            {isProjectOwner && (
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <UserPlus size={15} />
                Add
              </button>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {currentProject.members?.map((member) => {
              const isOwner = member._id === currentProject.owner?._id;

              return (
                <div
                  key={member._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {member.name}
                      </p>

                      {isOwner && (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                          Owner
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>

                  {isProjectOwner && !isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removingMemberId === member._id}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove member"
                    >
                      {removingMemberId === member._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tasks placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          {/* Header */}
          <div className="space-y-5">
            {/* Title + Create Task */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">Tasks</h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {filteredTasks.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Manage tasks associated with this project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
              >
                <Plus size={17} />
                Create Task
              </button>
            </div>

            {/* Search + Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              {/* Search */}
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-40"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {/* Priority */}
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-40"
              >
                <option value="ALL">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Task Error */}
          {taskError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {taskError}
            </div>
          )}

          {/* Loading */}
          {taskLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />

                <p className="text-sm text-slate-500">Loading tasks...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            /* Empty State */
            <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <CheckCircle2 size={23} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No tasks yet
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Create your first task to start managing work for this project.
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <AlertCircle size={23} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No matching tasks
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Try changing your search or filters to find a task.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                }}
                className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                Clear filters
              </button>
            </div>
          ) : (
            /* Tasks */
            <div className="mt-6 space-y-3">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Task information */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />
                        ) : task.status === "IN_PROGRESS" ? (
                          <Clock3
                            size={19}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />
                        ) : (
                          <Circle
                            size={19}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                        )}

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-800">
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 pl-7">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {task.status?.replace("_", " ")}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            task.priority === "HIGH"
                              ? "bg-red-50 text-red-600"
                              : task.priority === "MEDIUM"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {task.assignee && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                            {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleEditTask(task)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit task"
                      >
                        <Pencil size={16} />
                      </button>

                      {isProjectOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={deletingTaskId === task._id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete task"
                        >
                          {deletingTaskId === task._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId}
        onMemberAdded={handleMemberAdded}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={projectId}
        members={currentProject?.members || []}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={currentProject}
        onProjectUpdated={handleProjectUpdated}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        members={currentProject?.members || []}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default ProjectDetails;
