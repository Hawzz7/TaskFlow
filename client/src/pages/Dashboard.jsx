import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Plus,
} from "lucide-react";

import { clearUser } from "../redux/slices/authSlice";
import { logoutUser } from "../services/authServices";
import { getProjects } from "../services/projectServices";
import { getDashboardTasks } from "../services/taskServices";
import {
  setProjects,
  setProjectLoading,
  setProjectError,
} from "../redux/slices/projectSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { projects, loading } = useSelector((state) => state.project);

  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardTasks, setDashboardTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);

  const fetchProjects = async () => {
    dispatch(setProjectLoading(true));
    dispatch(setProjectError(null));

    try {
      const data = await getProjects();

      dispatch(setProjects(data.projects || []));
      setTotalProjectsCount(data.pagination?.totalProjects || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard projects:", error);

      dispatch(
        setProjectError(
          error.response?.data?.message || "Unable to load dashboard projects.",
        ),
      );
    } finally {
      dispatch(setProjectLoading(false));
    }
  };

  const fetchDashboardTasks = async () => {
    try {
      setTasksLoading(true);

      const data = await getDashboardTasks();

      setDashboardTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch dashboard tasks:", error);

      setDashboardTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDashboardTasks();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logoutUser();

      dispatch(clearUser());

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);

      dispatch(clearUser());

      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
  ];

  // task statistics
  const totalTasks = dashboardTasks.length;

  const pendingTasks = dashboardTasks.filter(
    (task) => task.status === "TODO",
  ).length;

  const completedTasks = dashboardTasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  // project statistics
  const totalProjects = totalProjectsCount;

  const inProgressProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              TaskFlow
            </h1>

            <p className="text-xs text-slate-400">Project management</p>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/dashboard";

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  closeMobileSidebar();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 rounded-xl bg-slate-50 px-3 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name}
            </p>

            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={19} />

            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500">{user?.role || "USER"}</p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Here's an overview of your projects and tasks.
            </p>
          </motion.div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total Projects */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Projects</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {loading ? "..." : totalProjects}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban size={21} />
                </div>
              </div>
            </motion.div>

            {/* In Progress Projects */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">In Progress Projects</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {loading ? "..." : inProgressProjects}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FolderKanban size={21} />
                </div>
              </div>
            </motion.div>

            {/* Completed Projects */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completed Projects</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {loading ? "..." : completedProjects}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FolderKanban size={21} />
                </div>
              </div>
            </motion.div>

            {/* Total Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Tasks</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {tasksLoading ? "..." : totalTasks}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CheckSquare size={21} />
                </div>
              </div>
            </motion.div>

            {/* Pending Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending Tasks</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {tasksLoading ? "..." : pendingTasks}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CheckSquare size={21} />
                </div>
              </div>
            </motion.div>

            {/* Completed Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completed Tasks</p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {tasksLoading ? "..." : completedTasks}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckSquare size={21} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Projects */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Recent Projects
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly access your latest projects.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View all
                <ArrowRight size={16} />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban size={22} />
                </div>

                <h4 className="mt-4 font-semibold text-slate-900">
                  No projects yet
                </h4>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Create your first project and start managing your work.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {projects.slice(0, 2).map((project) => (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FolderKanban size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {project.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${
                        project.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700"
                          : project.status === "IN_PROGRESS"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {project.status?.replace("_", " ")}
                    </span>

                    <ArrowRight size={17} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
