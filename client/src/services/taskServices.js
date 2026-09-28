import api from "./api";

export const createTask = async (taskData) => {
  const response = await api.post("api/tasks", taskData);

  return response.data;
};

export const getProjectTasks = async (projectId) => {
  const response = await api.get(`api/tasks/project/${projectId}`);

  return response.data;
};

export const getDashboardTasks = async () => {
  const response = await api.get("api/tasks/dashboard");

  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`api/tasks/${taskId}`);

  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/tasks/${taskId}`, taskData);

  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);

  return response.data;
};
