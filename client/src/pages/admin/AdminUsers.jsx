import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ShieldCheck, Users, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("admin/users");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Admin users error:", error);

      setError(error.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm text-slate-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <CircleAlert className="mx-auto text-red-600" size={28} />

          <h2 className="mt-4 text-lg font-semibold text-red-900">
            Unable to load users
          </h2>

          <p className="mt-2 text-sm text-red-700">{error}</p>

          <button
            onClick={fetchUsers}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Users
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor registered users.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">All Users</p>

            <p className="mt-1 text-xs text-slate-500">
              {users.length} registered users
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN")
                          : "N/A"}
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

export default AdminUsers;
