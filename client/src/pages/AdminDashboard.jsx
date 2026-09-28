import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  FolderKanban,
  ListTodo,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  CircleAlert,
  LogOut,
} from "lucide-react";

import api from "../services/api";
import { clearUser } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await api.post("api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearUser());
      navigate("/login", { replace: true });
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      /*
       * These endpoints assume your existing admin routes are:
       *
       * GET /admin/stats
       * GET /admin/users
       * GET /admin/projects
       * GET /admin/tasks
       */

      const [statsResponse, usersResponse, projectsResponse, tasksResponse] =
        await Promise.all([
          api.get("api/admin/stats"),
          api.get("api/admin/users"),
          api.get("api/admin/projects"),
          api.get("api/admin/tasks"),
        ]);

      setStats({
        users: statsResponse.data.stats?.users || 0,
        projects: statsResponse.data.stats?.projects || 0,
        tasks: statsResponse.data.stats?.tasks || 0,
      });

      setUsers(usersResponse.data.users || []);
      setProjects(projectsResponse.data.projects || []);
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(
        error.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const statCards = [
    {
      title: "Users",
      value: stats.users,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      description: "Total projects",
    },
    {
      title: "Tasks",
      value: stats.tasks,
      icon: ListTodo,
      description: "Total tasks",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

              <p className="text-sm text-slate-500">
                Loading admin dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <CircleAlert size={24} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-red-900">
                Unable to load dashboard
              </h2>

              <p className="mt-2 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={fetchAdminDashboard}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor users, projects and tasks across TaskFlow.
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </motion.div>

        {/* Stats */}
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
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 15,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={21} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent sections */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Recent Users */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Recent Users</h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Recently registered users
                </p>
              </div>

              <a
                href="/admin/users"
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  No users found.
                </div>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Recent Projects */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recent Projects
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Recently created projects
                </p>
              </div>

              <Link
                to="/admin/projects"
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  No projects found.
                </div>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {project.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Owner: {project.owner?.name || "Unknown"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {project.status?.replace("_", " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Recent Tasks */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Recent Tasks</h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Recently created tasks
                </p>
              </div>

              <Link
                to="/admin/tasks"
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {tasks.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  No tasks found.
                </div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Task
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Project
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Assignee
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Due Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {tasks.slice(0, 5).map((task) => (
                      <tr
                        key={task._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {task.title}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {task.project?.name || "Unknown"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {task.assignee?.name || "Unassigned"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {task.status?.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <CalendarDays size={14} />
                            {formatDate(task.dueDate)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
