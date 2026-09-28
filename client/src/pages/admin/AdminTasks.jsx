import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ListTodo, CircleAlert, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("api/admin/tasks");

      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Admin tasks error:", error);

      setError(error.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPriority = (priority) => {
    if (!priority) return "N/A";

    return priority
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "TODO":
        return "bg-slate-100 text-slate-700";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700";

      case "MEDIUM":
        return "bg-amber-50 text-amber-700";

      case "LOW":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleAlert size={24} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-red-900">
            Unable to load tasks
          </h2>

          <p className="mt-2 text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchTasks}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
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
          className="mb-6"
        >
          <Link
            to="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ListTodo size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View all tasks across TaskFlow.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tasks Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">All Tasks</p>

            <p className="mt-1 text-xs text-slate-500">
              {tasks.length} total tasks
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
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
                    Priority
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id} className="transition hover:bg-slate-50">
                      {/* Task */}
                      <td className="px-5 py-4">
                        <div className="min-w-[220px]">
                          <p className="text-sm font-semibold text-slate-800">
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {task.project?.name || "Unknown"}
                      </td>

                      {/* Assignee */}
                      <td className="px-5 py-4">
                        {task.assignee ? (
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {task.assignee.name}
                            </p>

                            {task.assignee.email && (
                              <p className="mt-1 text-xs text-slate-500">
                                {task.assignee.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            task.status,
                          )}`}
                        >
                          {formatStatus(task.status)}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                            task.priority,
                          )}`}
                        >
                          {formatPriority(task.priority)}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <CalendarDays size={14} />

                          {formatDate(task.dueDate)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTasks;
