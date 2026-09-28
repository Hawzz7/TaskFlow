import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  FolderKanban,
  CircleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("api/admin/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Admin projects error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

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

  const getStatusClasses = (status) => {
    switch (status) {
      case "PLANNING":
        return "bg-blue-50 text-blue-700";

      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";

      case "ARCHIVED":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">
            Loading projects...
          </p>
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
            Unable to load projects
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchProjects}
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
              <FolderKanban size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Projects
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View all projects across TaskFlow.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">
              All Projects
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {projects.length} total projects
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Owner
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Members
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Project */}
                      <td className="px-5 py-4">
                        <div className="min-w-[220px]">
                          <p className="text-sm font-semibold text-slate-800">
                            {project.name}
                          </p>

                          {project.description && (
                            <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {project.owner?.name || "Unknown"}
                          </p>

                          {project.owner?.email && (
                            <p className="mt-1 text-xs text-slate-500">
                              {project.owner.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            project.status
                          )}`}
                        >
                          {formatStatus(project.status)}
                        </span>
                      </td>

                      {/* Members */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {Array.isArray(project.members)
                            ? project.members.length
                            : 0}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(project.createdAt)}
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

export default AdminProjects;