import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import {
  FolderKanban,
  Plus,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  List,
  ArrowLeft,
} from "lucide-react";

import { getProjects, createProject } from "../services/projectServices";

import {
  setProjects,
  setProjectLoading,
  setProjectError,
  addProject,
  setProjectPagination,
} from "../redux/slices/projectSlice";
import CreateProjectModal from "../components/CreateProjectModal";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  PLANNING: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
};

const formatDate = (date) => {
  if (!date) return "Not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Projects = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");

  const [currentPage, setCurrentPage] = useState(1);

  const PROJECTS_PER_PAGE = 6;

  const { projects, loading, error, pagination } = useSelector(
    (state) => state.project,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  const fetchProjects = async (page = currentPage) => {
    dispatch(setProjectLoading(true));
    dispatch(setProjectError(null));

    try {
      const data = await getProjects(page, PROJECTS_PER_PAGE);

      console.log("Projects API response:", data);

      dispatch(setProjects(data.projects || []));
      dispatch(setProjectPagination(data.pagination));
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      dispatch(
        setProjectError(
          error.response?.data?.message ||
            "Unable to load projects. Please try again.",
        ),
      );
    } finally {
      dispatch(setProjectLoading(false));
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const handleCreateProject = async (projectData) => {
    try {
      setCreatingProject(true);

      await createProject(projectData);

      setIsCreateModalOpen(false);

      if (currentPage === 1) {
        fetchProjects(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Create project error:", error);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <FolderKanban size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Projects
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your projects and track their progress.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full items-center gap-3 sm:w-auto">
            {/* View toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <LayoutGrid size={18} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List view"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* New project */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] sm:flex-none"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

              <p className="text-sm text-slate-500">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-60 items-center justify-center rounded-2xl border border-red-200 bg-red-50"
          >
            <div className="flex max-w-md flex-col items-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>

              <h2 className="font-semibold text-red-900">
                Unable to load projects
              </h2>

              <p className="mt-1 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={fetchProjects}
                className="mt-5 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FolderKanban size={26} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No projects yet
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first project to start managing tasks and team
              members.
            </p>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create Project
            </button>
          </motion.div>
        )}

        {/* Projects */}
        {!loading && !error && projects.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-4"
            }
          >
            {projects.map((project) => (
              <motion.div
                key={project._id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "grid"
                    ? "group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    : "group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-6"
                }
              >
                {/* Project information */}
                <div className="min-w-0 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {project.name}
                      </h2>

                      <p
                        className={
                          viewMode === "grid"
                            ? "mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500"
                            : "mt-1 line-clamp-2 text-sm leading-5 text-slate-500"
                        }
                      >
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <FolderKanban size={18} />
                    </div>
                  </div>

                  {/* Status & Priority */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[project.status] ||
                        "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {project.status?.replace("_", " ")}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        priorityStyles[project.priority] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {project.priority} Priority
                    </span>
                  </div>

                  {/* Dates */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "mt-5 space-y-2 border-t border-slate-100 pt-4"
                        : "mt-5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:mt-4 sm:grid-cols-2 sm:border-t-0 sm:pt-0"
                    }
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Start date</span>

                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <CalendarDays size={15} />
                        {formatDate(project.startDate)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Due date</span>

                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <CalendarDays size={15} />
                        {formatDate(project.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View project */}
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className={
                    viewMode === "grid"
                      ? "mt-5 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                      : "mt-5 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 sm:mt-0"
                  }
                >
                  View Project
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
            {/* Results info */}
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pagination.totalPages}
              </span>
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={creatingProject}
      />
    </div>
  );
};

export default Projects;
