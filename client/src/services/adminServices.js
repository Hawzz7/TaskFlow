import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("api/admin/stats");

  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get("api/admin/users");

  return response.data;
};

export const getAdminProjects = async () => {
  const response = await api.get("api/admin/projects");

  return response.data;
};

export const getAdminTasks = async () => {
  const response = await api.get("api/admin/tasks");

  return response.data;
};